// =============================================================
// FastAPI 应用开发实战 - 第十六批章节(实战项目,共 4 章)
// 章节 61-64:RESTful API 完整项目 / GraphQL 集成 / 微服务架构 / 性能优化
// =============================================================

export const chapters = [
  // =============================================================
  // 第六十一章:实战:RESTful API 完整项目
  // =============================================================
  {
    id: 'proj-rest-api',
    group: '实战项目',
    icon: '🌐',
    title: '实战:RESTful API 完整项目',
    content: `## 第六十一章　实战:RESTful API 完整项目

### 61.1 需求分析

本章把前面学的东西串起来,做一个完整的博客系统 API。需求:

- **用户**:注册、登录、修改资料;
- **文章**:发布、编辑、删除、列表、详情;
- **评论**:对文章评论、回复评论、删除;
- **标签**:文章打标签、按标签筛选;
- **权限**:作者才能编辑自己的文章、管理员能删任何文章。

**接口清单**(RESTful 风格):

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| POST | /auth/register | 注册 | 公开 |
| POST | /auth/login | 登录拿 token | 公开 |
| GET | /users/me | 当前用户信息 | 已登录 |
| PUT | /users/me | 修改资料 | 已登录 |
| GET | /posts | 文章列表(分页) | 公开 |
| POST | /posts | 发布文章 | 已登录 |
| GET | /posts/{id} | 文章详情 | 公开 |
| PUT | /posts/{id} | 编辑文章 | 作者本人 |
| DELETE | /posts/{id} | 删除文章 | 作者或管理员 |
| GET | /posts/{id}/comments | 文章评论 | 公开 |
| POST | /posts/{id}/comments | 发评论 | 已登录 |

### 61.2 项目结构

\`\`\`
blog/
├── app/
│   ├── main.py                  # 入口
│   ├── core/
│   │   ├── config.py            # 配置
│   │   ├── security.py          # JWT、密码哈希
│   │   └── deps.py              # 通用依赖(get_db、get_current_user)
│   ├── api/v1/
│   │   ├── router.py            # 路由汇总
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── posts.py
│   │   └── comments.py
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── post_service.py
│   │   └── comment_service.py
│   ├── crud/
│   │   ├── base.py
│   │   ├── user.py
│   │   ├── post.py
│   │   └── comment.py
│   ├── models/
│   │   ├── base.py
│   │   ├── user.py
│   │   ├── post.py
│   │   └── comment.py
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── post.py
│   │   └── comment.py
│   └── utils/
│       └── pagination.py
├── tests/
├── .env
└── requirements.txt
\`\`\`

### 61.3 数据模型(关系设计)

\`\`\`python
# app/models/base.py
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

# app/models/user.py
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    nickname: Mapped[str] = mapped_column(String(50))
    is_admin: Mapped[bool] = mapped_column(default=False)

    # 关系:一个用户有多篇文章、多条评论
    posts: Mapped[list["Post"]] = relationship(back_populates="author", cascade="all, delete-orphan")
    comments: Mapped[list["Comment"]] = relationship(back_populates="author", cascade="all, delete-orphan")

# app/models/post.py
from sqlalchemy import String, Text, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base
from sqlalchemy import DateTime
import datetime

# 文章和标签是多对多,需要中间表
post_tags = Table(
    "post_tags", Base.metadata,
    Column("post_id", ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    content: Mapped[str] = mapped_column(Text)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    author: Mapped["User"] = relationship(back_populates="posts")
    comments: Mapped[list["Comment"]] = relationship(back_populates="post", cascade="all, delete-orphan")
    tags: Mapped[list["Tag"]] = relationship(secondary=post_tags, back_populates="posts")

# app/models/comment.py
class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True)
    content: Mapped[str] = mapped_column(Text)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"))
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())

    post: Mapped["Post"] = relationship(back_populates="comments")
    author: Mapped["User"] = relationship(back_populates="comments")
    parent: Mapped["Comment | None"] = relationship(remote_side=[id], back_populates="replies")
    replies: Mapped[list["Comment"]] = relationship(back_populates="parent")
\`\`\`

**关系解读**:

- User → Post:一对多(一个用户多篇文章);
- Post → Comment:一对多(一篇文章多条评论);
- Comment → Comment:自引用(评论的回复,通过 parent_id);
- Post ↔ Tag:多对多(通过中间表 post_tags)。

### 61.4 Pydantic schema 分层

\`\`\`python
# app/schemas/user.py
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    nickname: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    nickname: str
    is_admin: bool
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    nickname: str | None = None
    password: str | None = None

# app/schemas/post.py
class PostCreate(BaseModel):
    title: str
    content: str
    tag_ids: list[int] = []

class PostUpdate(BaseModel):
    title: str | None = None
    content: str | None = None

class PostOut(BaseModel):
    id: int
    title: str
    content: str
    author_id: int
    created_at: datetime
    class Config:
        from_attributes = True
\`\`\`

### 61.5 JWT 认证

\`\`\`python
# app/core/security.py
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """密码哈希(存数据库)。"""
    return pwd_ctx.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    """校验密码。"""
    return pwd_ctx.verify(plain, hashed)

def create_access_token(subject: str, expires_minutes: int | None = None) -> str:
    """生成 JWT。"""
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> str | None:
    """解析 JWT,返回 subject(用户 id)。"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None
\`\`\`

### 61.6 依赖注入:当前用户

\`\`\`python
# app/core/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.security import decode_token, verify_password
from app.crud.user import get_user_by_email
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_db():
    """数据库 session 依赖。"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_db)) -> User:
    """从 token 解出当前用户。"""
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的认证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user_id = decode_token(token)
    if not user_id:
        raise credentials_error
    user = db.get(User, int(user_id))
    if not user:
        raise credentials_error
    return user

def get_current_admin(user: User = Depends(get_current_user)) -> User:
    """要求当前用户是管理员。"""
    if not user.is_admin:
        raise HTTPException(403, "需要管理员权限")
    return user
\`\`\`

### 61.7 路由层示例:文章

\`\`\`python
# app/api/v1/posts.py
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.post import PostCreate, PostUpdate, PostOut
from app.services.post_service import PostService

router = APIRouter(prefix="/posts", tags=["文章"])

@router.get("/", response_model=list[PostOut])
def list_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    tag: str | None = None,
    db = Depends(get_db),
):
    """文章列表,支持分页和按标签筛选。"""
    service = PostService(db)
    return service.list_posts(skip, limit, tag)

@router.get("/{post_id}", response_model=PostOut)
def get_post(post_id: int, db = Depends(get_db)):
    service = PostService(db)
    post = service.get_post(post_id)
    if not post:
        raise HTTPException(404, "文章不存在")
    return post

@router.post("/", response_model=PostOut, status_code=201)
def create_post(
    post_in: PostCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db),
):
    """发布文章,需要登录。"""
    service = PostService(db)
    return service.create_post(post_in, current_user.id)

@router.put("/{post_id}", response_model=PostOut)
def update_post(
    post_id: int,
    post_in: PostUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db),
):
    """编辑文章,只有作者本人能改。"""
    service = PostService(db)
    post = service.get_post(post_id)
    if not post:
        raise HTTPException(404, "文章不存在")
    if post.author_id != current_user.id:
        raise HTTPException(403, "只能编辑自己的文章")
    return service.update_post(post, post_in)

@router.delete("/{post_id}", status_code=204)
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db),
):
    """删除文章,作者或管理员可以。"""
    service = PostService(db)
    post = service.get_post(post_id)
    if not post:
        raise HTTPException(404, "文章不存在")
    if post.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(403, "无权删除")
    service.delete_post(post)
\`\`\`

### 61.8 业务层示例

\`\`\`python
# app/services/post_service.py
from sqlalchemy.orm import Session
from app.models.post import Post
from app.models.tag import Tag
from app.schemas.post import PostCreate, PostUpdate

class PostService:
    def __init__(self, db: Session):
        self.db = db

    def list_posts(self, skip: int, limit: int, tag: str | None):
        query = self.db.query(Post)
        if tag:
            query = query.join(Post.tags).where(Tag.name == tag)
        return query.offset(skip).limit(limit).all()

    def get_post(self, post_id: int):
        return self.db.get(Post, post_id)

    def create_post(self, post_in: PostCreate, author_id: int) -> Post:
        post = Post(
            title=post_in.title,
            content=post_in.content,
            author_id=author_id,
        )
        # 关联标签
        if post_in.tag_ids:
            tags = self.db.query(Tag).filter(Tag.id.in_(post_in.tag_ids)).all()
            post.tags = tags
        self.db.add(post)
        self.db.commit()
        self.db.refresh(post)
        return post

    def update_post(self, post: Post, post_in: PostUpdate):
        for field, value in post_in.model_dump(exclude_unset=True).items():
            setattr(post, field, value)
        self.db.commit()
        self.db.refresh(post)
        return post

    def delete_post(self, post: Post):
        self.db.delete(post)
        self.db.commit()
\`\`\`

### 61.9 登录接口

\`\`\`python
# app/api/v1/auth.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from app.core.deps import get_db
from app.core.security import verify_password, create_access_token
from app.crud.user import get_user_by_email

router = APIRouter(prefix="/auth", tags=["认证"])

@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db = Depends(get_db)):
    """用 OAuth2PasswordRequestForm,字段是 username/password。"""
    # username 字段实际存的是 email
    user = get_user_by_email(db, form.username)
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(401, "邮箱或密码错误")
    token = create_access_token(subject=str(user.id))
    return {"access_token": token, "token_type": "bearer"}
\`\`\`

> 用 \`OAuth2PasswordRequestForm\` 的好处:Swagger UI 会自动生成"Authorize"按钮,可以直接在文档里登录测试。

### 61.10 路由汇总与启动

\`\`\`python
# app/api/v1/router.py
from fastapi import APIRouter
from app.api.v1 import auth, users, posts, comments

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(posts.router)
api_router.include_router(comments.router)

# app/main.py
from fastapi import FastAPI
from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(title=settings.APP_NAME)
app.include_router(api_router)
\`\`\`

### 61.11 错误处理与文档

\`\`\`python
# 全局异常处理
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """兜底未捕获异常,返回 500。"""
    logger.exception("未处理异常")
    return JSONResponse(status_code=500, content={"detail": "服务器内部错误"})

# 启动后访问 /docs 看 Swagger 文档
\`\`\`

### 61.12 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 权限检查写在 service | 业务层耦合 HTTP 概念 | 权限在路由层查,业务层不管 |
| 删文章没 \`ondelete=CASCADE\` | 文章删了评论还在 | 关系设级联 |
| \`OAuth2PasswordRequestForm\` 没装 | 启动报错 | \`pip install python-multipart\` |
| 创建文章没关联标签 | 标签存了但没连上 | 设 \`post.tags = tags\` |
| 列表没分页 | 数据多了全返回,卡死 | \`Query(20, le=100)\` |

> **本章小结**:完整项目就是分层架构 + JWT 认证 + 权限控制 + 关系设计。重点:数据模型想清楚关系、schema 入参出参分离、权限在路由层用依赖做。下一章讲怎么把 RESTful 换成 GraphQL。`,
  },

  // =============================================================
  // 第六十二章:实战:GraphQL 集成
  // =============================================================
  {
    id: 'proj-graphql',
    group: '实战项目',
    icon: '🔮',
    title: '实战:GraphQL 集成',
    content: `## 第六十二章　实战:GraphQL 集成

### 62.1 GraphQL 是什么

GraphQL 是 Facebook 推出的查询语言,核心思想:**客户端发一个查询语句,服务端按语句返回数据**。

REST 和 GraphQL 的根本区别:

| 维度 | REST | GraphQL |
| --- | --- | --- |
| 端点 | 多个(\`/users\`、\`/posts\`) | 单个(\`/graphql\`) |
| 返回字段 | 服务端固定 | 客户端指定 |
| 关联数据 | 要发多个请求 | 一个请求搞定 |
| 版本 | \`/v1\`、\`/v2\` | 无版本,加字段不影响旧客户端 |
| 缓存 | HTTP 缓存友好 | 复杂,要自己实现 |

**REST 的痛点**:

- **过度获取**:为了显示文章标题,却返回了整个文章对象;
- **获取不足**:要显示文章+作者+评论,得发 3 个请求;
- **字段固定**:前端要加个字段,后端要改接口。

**GraphQL 怎么解决**:

\`\`\`graphql
# 客户端想要什么字段,自己写
query {
  post(id: 1) {
    title
    author {
      nickname
    }
    comments {
      content
      author {
        nickname
      }
    }
  }
}
\`\`\`

一个请求,精确拿到要的字段,不多不少。

### 62.2 什么时候用 GraphQL

**适合**:

- 客户端需求复杂,多端(Web、App、小程序)字段不同;
- 数据关联深,REST 要发 N 个请求;
- 想让前端灵活控制返回;
- 团队愿意投入。

**不适合**:

- 简单 CRUD,REST 足够;
- 对 HTTP 缓存强依赖(GraphQL 用 POST,缓存麻烦);
- 团队不熟,GraphQL 心智负担比 REST 重。

> 不要为了用而用。**REST 能解决 80% 场景,GraphQL 解决剩下 20% 复杂的**。

### 62.3 strawberry-graphql 库

Python 生态有几个 GraphQL 库,\`strawberry-graphql\` 最现代(类型注解风格,和 FastAPI 哲学一致):

\`\`\`bash
pip install strawberry-graphql[fastapi]
\`\`\`

### 62.4 定义 Schema:type

Schema 是 GraphQL 的"数据合同",定义有哪些类型和字段:

\`\`\`python
# app/graphql/schema.py
import strawberry
from typing import Optional

# 类型定义,类似 Pydantic 但用 @strawberry.type
@strawberry.type
class User:
    id: int
    email: str
    nickname: str

@strawberry.type
class Comment:
    id: int
    content: str
    author: "User"

@strawberry.type
class Post:
    id: int
    title: str
    content: str
    author: "User"
    comments: list["Comment"]

    # resolver:关联字段怎么取
    @strawberry.field
    def comments(self) -> list["Comment"]:
        # 这里查数据库,返回评论列表
        from app.crud.comment import get_comments_by_post
        db_comments = get_comments_by_post(self.id)
        return [Comment(id=c.id, content=c.content, author=User(...)) for c in db_comments]
\`\`\`

### 62.5 Query:查询入口

\`\`\`python
# app/graphql/queries.py
import strawberry
from app.graphql.schema import User, Post
from app.crud.user import get_user as crud_get_user
from app.crud.post import get_post as crud_get_post
from app.core.deps import get_db

@strawberry.type
class Query:
    @strawberry.field
    def user(self, id: int) -> User | None:
        """查单个用户。"""
        db = next(get_db())
        u = crud_get_user(db, id)
        if not u:
            return None
        return User(id=u.id, email=u.email, nickname=u.nickname)

    @strawberry.field
    def post(self, id: int) -> Post | None:
        """查单个文章。"""
        db = next(get_db())
        p = crud_get_post(db, id)
        if not p:
            return None
        return Post(id=p.id, title=p.title, content=p.content)
\`\`\`

**注意**:\`@strawberry.field\` 装饰器的方法就是 resolver,客户端查到这个字段时,会调这个方法取数据。

### 62.6 Mutation:修改入口

\`\`\`python
# app/graphql/mutations.py
import strawberry
from app.graphql.schema import Post
from app.services.post_service import PostService

@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_post(self, title: str, content: str, token: str) -> Post:
        """发布文章。"""
        # 验证 token,拿用户(简化)
        user = verify_token(token)
        if not user:
            raise Exception("未登录")
        db = next(get_db())
        service = PostService(db)
        post = service.create_post(PostCreate(title=title, content=content), user.id)
        return Post(id=post.id, title=post.title, content=post.content)
\`\`\`

### 62.7 组装 Schema 并集成到 FastAPI

\`\`\`python
# app/graphql/schema.py(完整)
import strawberry
from app.graphql.queries import Query
from app.graphql.mutations import Mutation

schema = strawberry.Schema(query=Query, mutation=Mutation)

# app/main.py
from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter

app = FastAPI()
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")
\`\`\`

访问 \`http://localhost:8000/graphql\`,会看到 GraphQL Playground / Apollo Sandbox,可以直接写查询测试。

### 62.8 客户端怎么查

\`\`\`graphql
# 查文章详情(只要标题和作者昵称)
query {
  post(id: 1) {
    title
    author {
      nickname
    }
  }
}
\`\`\`

返回:

\`\`\`json
{
  "data": {
    "post": {
      "title": "Hello GraphQL",
      "author": {
        "nickname": "小明"
      }
    }
  }
}
\`\`\`

**对比 REST**:REST 要 \`GET /posts/1\` 拿到文章(含一堆字段),再 \`GET /users/123\` 拿作者昵称。GraphQL 一个请求,字段还精确。

### 62.9 GraphQL 认证

GraphQL 通常用 HTTP header 传 token,在 resolver 里读 context:

\`\`\`python
from strawberry.fastapi import GraphQLRouter
from fastapi import Request

async def get_context(request: Request):
    """从请求里取出 token,放进 context。"""
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    return {"token": token, "user": verify_token(token)}

graphql_app = GraphQLRouter(schema, context_getter=get_context)
app.include_router(graphql_app, prefix="/graphql")

# resolver 里用 info.context 拿
@strawberry.type
class Query:
    @strawberry.field
    def me(self, info) -> User | None:
        user = info.context.get("user")
        if not user:
            raise Exception("未登录")
        return User(id=user.id, ...)
\`\`\`

### 62.10 N+1 问题与 DataLoader

GraphQL 的杀手锏"按需取关联数据"也带来坑:**N+1 查询**。

\`\`\`python
# 危险:列表查 10 篇文章,每篇又查一次作者,共 11 次 SQL
@strawberry.field
def author(self) -> "User":
    db = next(get_db())
    a = db.get(User, self.author_id)   # 每篇文章查一次!
    return User(...)
\`\`\`

**解法**:用 \`DataLoader\` 批量取:

\`\`\`python
from strawberry.dataloader import DataLoader

async def load_users(user_ids: list[int]) -> list[User]:
    """一次查所有用户,而不是一个个查。"""
    db = next(get_db())
    users = db.query(User).filter(User.id.in_(user_ids)).all()
    user_map = {u.id: u for u in users}
    return [user_map.get(uid) for uid in user_ids]

# 用时
user_loader = DataLoader(load_fn=load_users)

@strawberry.field
async def author(self) -> "User":
    user = await user_loader.load(self.author_id)
    return User(id=user.id, ...)
\`\`\`

> DataLoader 把"10 次单查"合并成"1 次批量查",性能天差地别。这是 GraphQL 必须掌握的优化。

### 62.11 REST vs GraphQL 实战对比

| 场景 | REST | GraphQL |
| --- | --- | --- |
| 取文章+作者+评论 | 3 个请求 | 1 个请求 |
| App 只要标题 | 还是返回完整对象 | 只要 title 字段 |
| 加新字段 | 改接口(可能 v2) | 加 schema 字段,旧客户端无感 |
| 缓存 | 浏览器/CDN 缓存友好 | 需 Apollo Client 缓存 |
| 文件上传 | 简单(multipart) | 复杂(要 multipart 扩展) |
| 调试 | curl 直接测 | 需要 Playground |
| 学习成本 | 低 | 中 |

### 62.12 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| resolver 同步查数据库,N+1 | 慢 | 用 DataLoader 批量 |
| Mutation 没 auth | 谁都能改数据 | 从 context 取 user |
| Schema 字段和 resolver 对不上 | 报错 | 字段名要一致 |
| 把 GraphQL 当 REST 用 | 丢了优势 | 利用"按需取字段" |
| 返回 ORM 对象直接 | 类型不匹配 | 转成 strawberry type |

> **本章小结**:GraphQL 让客户端精确控制返回字段,适合复杂关联场景。用 strawberry 定义 type/query/mutation,集成到 FastAPI 用 GraphQLRouter。**重点防 N+1**:用 DataLoader 批量取。下一章讲微服务架构。`,
  },

  // =============================================================
  // 第六十三章:实战:微服务架构
  // =============================================================
  {
    id: 'proj-microservice',
    group: '实战项目',
    icon: '🏛️',
    title: '实战:微服务架构',
    content: `## 第六十三章　实战:微服务架构

### 63.1 微服务 vs 单体

**单体架构**:所有功能在一个代码库、一个进程里跑。

\`\`\`
单体应用
├── 用户模块
├── 订单模块
├── 支付模块
└── 库存模块
\`\`\`

**微服务架构**:按业务拆成多个独立服务,各自一个进程、一个数据库。

\`\`\`
用户服务(独立 DB)  ←→  订单服务(独立 DB)
                          ↓
                      支付服务(独立 DB)
                          ↓
                      库存服务(独立 DB)
\`\`\`

### 63.2 微服务适用场景

**适合**:

- **团队大**:几十上百人,一个代码库冲突爆炸;
- **需求差异大**:用户服务迭代快,支付服务求稳,拆开互不影响;
- **技术栈多样**:用户服务用 Python,推荐服务用 Go,各自选最合适的;
- **独立扩展**:大促时订单服务要扩容,用户服务不用动。

**不适合**:

- **团队小**:几个人维护一堆服务,运维成本爆炸;
- **业务简单**:就一个 CRUD 后台,微服务是过度设计;
- **强一致性需求**:跨服务事务很难,单体里一个事务就解决。

> **拆分的代价**:分布式事务难、调试难、运维复杂。**只有痛点真的来自"单体太大",才考虑拆**。小团队宁可单体+模块化。

### 63.3 服务拆分原则

**按业务领域拆**,不按技术层拆:

\`\`\`
✅ 按业务:用户服务、订单服务、商品服务
❌ 按技术:数据库服务、缓存服务、API 服务
\`\`\`

**每个服务有独立数据库**:

\`\`\`
用户服务 → user_db
订单服务 → order_db
商品服务 → product_db
\`\`\`

> 服务之间不能直接读对方的数据库,只能通过 API 调用。这保证了"服务自治",换数据库不影响别人。

**拆分粒度**:

- 太粗:又变成小单体;
- 太细:服务数量爆炸,管理灾难;
- 经验:一个服务一个清晰的业务领域,2-3 个开发能维护。

### 63.4 服务间通信

| 方式 | 协议 | 适用 |
| --- | --- | --- |
| HTTP/REST | HTTP + JSON | 简单、通用,大多数场景 |
| gRPC | HTTP/2 + Protobuf | 高性能、强类型、内部服务 |
| 消息队列 | AMQP/Kafka | 异步解耦、削峰填谷 |

**同步 vs 异步**:

- **同步(HTTP/gRPC)**:调用方等结果。适合"必须立即知道结果"的场景(下单要扣库存);
- **异步(消息队列)**:发完就走,不等。适合"通知"场景(下单后发邮件、记日志)。

### 63.5 示例:两个服务通过 HTTP 调用

订单服务要调用户服务查用户信息:

\`\`\`python
# user_service/app/main.py(用户服务)
from fastapi import FastAPI

app = FastAPI(title="用户服务")

@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"id": user_id, "nickname": "小明", "email": "xm@example.com"}

# order_service/app/main.py(订单服务)
from fastapi import FastAPI
import httpx

app = FastAPI(title="订单服务")

USER_SERVICE_URL = "http://user-service:8001"   # 用户服务地址

@app.get("/orders/{order_id}")
async def get_order(order_id: int):
    # 先查订单(模拟)
    order = {"id": order_id, "user_id": 1, "amount": 99.9}
    # 再调用户服务查用户信息
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{USER_SERVICE_URL}/users/{order['user_id']}")
        user = r.json()
    return {"order": order, "user": user}
\`\`\`

> 注意:这里 \`f"{USER_SERVICE_URL}/users/..."\` 是 Python f-string,花括号是 \`{}\`,不是 JS 的 \`\${}\`,放在模板字符串里不会冲突。

### 63.6 API 网关

微服务一多,客户端要记一堆地址。API 网关统一入口:

\`\`\`
客户端 → 网关 → 用户服务
              → 订单服务
              → 商品服务
\`\`\`

**网关职责**:

- **路由**:按路径转发(\`/users/*\` 到用户服务);
- **认证**:统一校验 token,通过后把用户信息传给后端;
- **限流**:统一限流规则;
- **日志**:统一记录请求;
- **聚合**:把多个服务的响应合并(可选)。

\`\`\`python
# gateway/app/main.py(用 FastAPI 当网关,简单场景可行)
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
import httpx

app = FastAPI(title="API 网关")

SERVICES = {
    "users": "http://user-service:8001",
    "orders": "http://order-service:8002",
    "products": "http://product-service:8003",
}

@app.api_route("/{service}/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def gateway(service: str, path: str, request: Request):
    if service not in SERVICES:
        raise HTTPException(404, "未知服务")
    # 这里省略 token 校验
    target = f"{SERVICES[service]}/{path}"
    async with httpx.AsyncClient() as client:
        r = await client.request(
            request.method, target,
            params=request.query_params,
            headers={"X-User-Id": "1"},   # 传给后端
        )
        return JSONResponse(content=r.json(), status_code=r.status_code)
\`\`\`

> 生产更推荐专业网关:Kong、APISIX、Nginx + Lua,或云厂商的 API Gateway。

### 63.7 服务发现

服务一多,地址管理是大问题。**服务发现**让服务自己注册、互相发现:

- **注册中心**:Consul、etcd、Nacos;
- **服务启动时注册**:把自己的 IP + 端口写进注册中心;
- **调用方查询**:要调用户服务,问注册中心"用户服务在哪",拿到地址列表。

\`\`\`python
# 简化:用 Consul
import consul
c = consul.Consul()

# 注册
c.agent.service.register(
    name="user-service",
    address="10.0.0.5",
    port=8001,
    check=consul.Check.http("http://10.0.0.5:8001/health", "10s")
)

# 发现
_, services = c.health.service("user-service", passing=True)
addresses = [(s["Service"]["Address"], s["Service"]["Port"]) for s in services]
# 挑一个调用
\`\`\`

> 配合 k8s,服务发现是内置的(Service + DNS),不用额外装。

### 63.8 分布式事务:Saga

跨服务的事务很难(不能 BEGIN...COMMIT 跨数据库)。**Saga 模式**用"补偿事务"解决:

\`\`\`
下单流程:
1. 创建订单(订单服务)  ── 失败补偿:删除订单
2. 扣库存(库存服务)      ── 失败补偿:回滚库存
3. 扣款(支付服务)        ── 失败补偿:退款

执行:
1. 创建订单 ✓
2. 扣库存 ✓
3. 扣款 ✗ 失败!

补偿(反向):
3. 跳过(没扣成)
2. 回滚库存 ✓
1. 删除订单 ✓
\`\`\`

> 每步都要有对应的"补偿动作",失败时按反序执行补偿。复杂但解决了跨服务一致性。

### 63.9 分布式追踪:Jaeger

微服务调用链深,一个请求可能经过 5 个服务,出问题难定位。**分布式追踪**给每个请求发一个 trace_id,贯穿所有服务:

\`\`\`python
# 每个 FastAPI 服务装
pip install opentelemetry-instrumentation-fastapi

# 启动时初始化
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

trace.set_tracer_provider(TracerProvider())
jaeger_exporter = JaegerExporter(agent_host_name="jaeger", agent_port=6831)
trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(jaeger_exporter)
)

app = FastAPI()
FastAPIInstrumentor.instrument_app(app)   # 自动追踪每个请求
\`\`\`

在 Jaeger UI 里能看到一个请求经过了哪些服务、每段耗时,定位瓶颈一目了然。

### 63.10 FastAPI 在微服务的角色

每个微服务就是一个 FastAPI app:

\`\`\`
user_service/
├── app/main.py        # FastAPI app
├── Dockerfile
└── docker-compose.yml

order_service/
├── app/main.py        # 另一个 FastAPI app
├── Dockerfile
└── docker-compose.yml
\`\`\`

部署时每个服务一个容器,用 docker-compose 或 k8s 编排。

### 63.11 微服务 vs 单体对照

| 维度 | 单体 | 微服务 |
| --- | --- | --- |
| 部署 | 一次 | 多次 |
| 扩展 | 整体扩 | 按服务扩 |
| 技术栈 | 统一 | 多样 |
| 团队协作 | 一个代码库 | 多个代码库 |
| 调试 | 简单(一个进程) | 复杂(跨服务) |
| 数据一致性 | 一个事务 | Saga 等复杂方案 |
| 运维 | 简单 | 复杂(监控、追踪、服务发现) |
| 适用 | 小团队、业务简单 | 大团队、业务复杂 |

### 63.12 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 服务共享数据库 | 失去自治性,改库影响别的服务 | 每个服务独立 DB |
| 同步调用链太长 | 一处慢全链路慢,一挂全挂 | 用消息队列解耦 |
| 没分布式追踪 | 出问题不知道卡哪 | 用 Jaeger/SkyWalking |
| 拆得太细 | 服务数量爆炸,运维灾难 | 按业务领域,粒度适中 |
| 跨服务事务用 BEGIN/COMMIT | 根本不行 | 用 Saga / TCC |
| 网关做业务逻辑 | 网关变重 | 网关只做路由、认证、限流 |

> **本章小结**:微服务按业务领域拆分,每个服务独立部署+独立数据库,通过 HTTP/gRPC/消息队列通信。API 网关统一入口,服务发现动态寻址,Jaeger 做分布式追踪。**只有单体真的痛了才拆,微服务的运维成本远高于单体**。下一章讲性能优化。`,
  },

  // =============================================================
  // 第六十四章:实战:性能优化
  // =============================================================
  {
    id: 'proj-perf',
    group: '实战项目',
    icon: '⚡',
    title: '实战:性能优化',
    content: `## 第六十四章　实战:性能优化

### 64.1 性能优化的方向

性能优化不是"哪儿慢改哪儿",而是有方向地系统分析:

| 方向 | 指标 | 优化手段 |
| --- | --- | --- |
| 响应时间 | 单请求耗时(P95、P99) | 数据库索引、缓存、减少 N+1 |
| 吞吐量 | QPS(每秒请求数) | 异步、并发、worker 数 |
| 资源占用 | CPU、内存、带宽 | 算法优化、连接复用 |

**优化原则**:

1. **先量化再优化**:不测量就优化是盲改,先压测找到瓶颈;
2. **优化瓶颈**:80% 时间花在 20% 代码上,优化这 20% 收益最大;
3. **别过度优化**:接口 50ms 够用了,别纠结优化到 10ms。

### 64.2 模型与校验优化

**Pydantic 模型别太重**:

\`\`\`python
# ❌ 入参模型带了无关字段
class UserCreate(BaseModel):
    email: str
    password: str
    nickname: str
    created_at: datetime   # 不该让客户端传!
    is_admin: bool        # 不该让客户端传!

# ✅ 入参只要必要的
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    nickname: str
\`\`\`

**响应模型别返回整个 ORM 对象**:

\`\`\`python
# ❌ 返回所有字段(含 hashed_password)
@app.get("/users", response_model=list[User])
def list_users(): ...

# ✅ 只返回该给前端的字段
@app.get("/users", response_model=list[UserOut])
def list_users(): ...
\`\`\`

> Pydantic v2 比 v1 快 5-50 倍,务必用 v2。

### 64.3 数据库优化:索引

慢查询最常见的原因是**没加索引**:

\`\`\`python
# ❌ 没索引,查 email 要全表扫描
email: Mapped[str] = mapped_column(String(255))

# ✅ 加索引,查询走 B+ 树
email: Mapped[str] = mapped_column(String(255), index=True)
# 唯一索引(也带索引功能)
email: Mapped[str] = mapped_column(String(255), unique=True)

# 组合索引(常用查询条件组合)
__table_args__ = (
    Index("idx_user_status", "user_id", "status"),
)
\`\`\`

**索引使用注意**:

- 索引加速查询,但拖慢插入(每次插入要维护索引);
- 别滥用,查询慢的才加;
- 索引字段要参与 WHERE / JOIN / ORDER BY。

### 64.4 N+1 问题

最经典的性能杀手:

\`\`\`python
# ❌ N+1:查 10 篇文章,每篇查一次作者,共 11 次 SQL
posts = db.query(Post).limit(10).all()
for post in posts:
    print(post.author.nickname)   # 每次访问 author 都查一次!

# ✅ eager loading:1 次查文章 + 1 次查作者,共 2 次
from sqlalchemy.orm import selectinload
posts = db.query(Post).options(selectinload(Post.author)).limit(10).all()
for post in posts:
    print(post.author.nickname)   # 不再查数据库
\`\`\`

**eager loading 策略**:

| 策略 | 怎么查 | 适用 |
| --- | --- | --- |
| \`selectinload\` | 第二个 SELECT 用 IN | 一对多、多对一,推荐 |
| \`joinedload\` | 一个 JOIN 搞定 | 一对一、多对一 |
| \`subqueryload\` | 子查询 | 老用法,selectinload 更好 |

> 一句话:**只要循环里访问关联字段,就要 eager load**。

### 64.5 缓存:Redis

热点数据(首页文章、热门商品)每次查数据库太浪费,缓存起来:

\`\`\`python
import redis.asyncio as redis
import json
from functools import wraps

redis_client = redis.from_url("redis://localhost:6379")

async def get_or_set(key: str, ttl: int, fetch_func):
    """缓存模式:先查 Redis,没有再查数据库,查完写回。"""
    cached = await redis_client.get(key)
    if cached:
        return json.loads(cached)
    # 缓存没有,查数据库
    data = await fetch_func()
    # 写回缓存,TTL 秒后过期
    await redis_client.setex(key, ttl, json.dumps(data))
    return data

@app.get("/posts/hot")
async def hot_posts():
    async def fetch():
        # 查数据库
        db = next(get_db())
        return [p.title for p in db.query(Post).order_by(Post.views.desc()).limit(10).all()]
    return await get_or_set("hot_posts", ttl=300, fetch_func=fetch)
\`\`\`

**缓存失效策略**:

| 策略 | 做法 | 适用 |
| --- | --- | --- |
| TTL 过期 | 设过期时间 | 通用 |
| 主动失效 | 数据更新时删缓存 | 强一致 |
| 缓存预热 | 启动时加载 | 冷启动慢 |

### 64.6 异步优化:I/O 并发

I/O 密集型(调外部 API、查数据库)用 async 大幅提升吞吐:

\`\`\`python
# ❌ 同步:三个请求串行,3 秒
def fetch_all():
    a = requests.get("https://api.a.com").json()  # 1 秒
    b = requests.get("https://api.b.com").json()  # 1 秒
    c = requests.get("https://api.c.com").json()  # 1 秒
    return [a, b, c]  # 总共 3 秒

# ✅ 异步:三个请求并发,1 秒
import asyncio
import httpx

async def fetch_all():
    async with httpx.AsyncClient() as client:
        tasks = [
            client.get("https://api.a.com"),
            client.get("https://api.b.com"),
            client.get("https://api.c.com"),
        ]
        responses = await asyncio.gather(*tasks)
        return [r.json() for r in responses]  # 总共 1 秒
\`\`\`

> 关键:**异步不是让单个请求更快,而是让单 worker 同时处理更多请求**。

### 64.7 连接池

每次请求都建数据库连接很慢(握手开销),用连接池复用:

\`\`\`python
from sqlalchemy import create_engine

engine = create_engine(
    "mysql://...",
    pool_size=10,        # 常驻连接数
    max_overflow=20,     # 突发可多开
    pool_pre_ping=True,   # 用前 ping 一下,避免拿到断的连接
    pool_recycle=3600,    # 连接每小时回收,防数据库踢
)
\`\`\`

> 连接池大小别瞎设:太小请求排队,太大数据库扛不住。一般 \`pool_size + max_overflow\` 不超过数据库 \`max_connections\` 的 1/3。

### 64.8 中间件优化:GZip

响应体大时开 GZip 压缩,减少传输:

\`\`\`python
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)   # 大于 1KB 才压
\`\`\`

> JSON 接口开了 GZip,响应能小 70%,移动端尤其受益。

### 64.9 限流保护:令牌桶

高并发下保护后端,超出的请求直接拒绝:

\`\`\`python
# 简化版令牌桶限流(生产用 slowapi 库)
import time

class TokenBucket:
    def __init__(self, rate: int, capacity: int):
        self.rate = rate          # 每秒生成令牌数
        self.capacity = capacity  # 桶容量
        self.tokens = capacity
        self.last_time = time.monotonic()

    def allow(self) -> bool:
        now = time.monotonic()
        elapsed = now - self.last_time
        # 按时间补令牌
        self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)
        self.last_time = now
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False

bucket = TokenBucket(rate=100, capacity=200)   # 100 QPS,突发 200

@app.get("/api")
def api():
    if not bucket.allow():
        raise HTTPException(429, "请求太频繁")
    return {"msg": "ok"}
\`\`\`

> 生产推荐用 \`slowapi\` 库,内置 FastAPI 集成。

### 64.10 监控定位瓶颈

不知道哪慢,优化无从谈起。几个监控手段:

**1. 慢查询日志**

\`\`\`sql
-- MySQL 开启慢查询日志,超过 1 秒的 SQL 记下来
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;
\`\`\`

**2. APM(应用性能监控)**

\`\`\`python
# 用 Sentry / New Relic / Datadog
# 自动记录每个请求耗时,慢的标红
import sentry_sdk
sentry_sdk.init(dsn="...", traces_sample_rate=0.1)
\`\`\`

**3. 自定义计时**

\`\`\`python
import time
import logging

logger = logging.getLogger("perf")

@app.get("/slow")
def slow_api():
    t0 = time.perf_counter()
    db_result = query_db()
    t1 = time.perf_counter()
    logger.info(f"DB 查询耗时 {(t1-t0)*1000:.1f}ms")
    process_result = process(db_result)
    t2 = time.perf_counter()
    logger.info(f"处理耗时 {(t2-t1)*1000:.1f}ms")
    return process_result
\`\`\`

### 64.11 压测工具

优化前后要量化对比,用压测工具:

**locust(Python,可写脚本)**:

\`\`\`python
# locustfile.py
from locust import HttpUser, task, between

class ApiUser(HttpUser):
    wait_time = between(1, 3)   # 每个用户每 1-3 秒发一次

    @task
    def get_posts(self):
        self.client.get("/api/v1/posts/")

    @task(2)   # 权重 2,发两倍频率
    def get_users(self):
        self.client.get("/api/v1/users/")
\`\`\`

\`\`\`bash
locust -f locustfile.py
# 打开 http://localhost:8089,设并发数,开始压测
\`\`\`

**wrk(简单快速)**:

\`\`\`bash
# 100 并发,持续 30 秒
wrk -t4 -c100 -d30s http://localhost:8000/api/v1/posts/
\`\`\`

### 64.12 优化检查清单

| 优化点 | 检查项 |
| --- | --- |
| 数据库 | 慢查询有没有索引?有没有 N+1? |
| 缓存 | 热点数据缓存了吗?TTL 合理吗? |
| 异步 | I/O 操作用 async 了吗? |
| 连接池 | pool_size 够吗?有没有 pool_pre_ping? |
| 响应模型 | response_model 够精简吗?有没有返回多余字段? |
| 限流 | 接口有限流保护吗? |
| 压缩 | GZip 开了吗? |
| 监控 | 慢接口有监控吗?能定位瓶颈吗? |
| worker | Gunicorn worker 数合理吗? |

### 64.13 性能优化决策树

\`\`\`
接口慢?
├── 测量:哪一段慢?
│   ├── 数据库慢?
│   │   ├── 查询慢 → 加索引
│   │   ├── N+1 → eager load
│   │   └── 连接不够 → 调连接池
│   ├── 外部 API 慢?
│   │   ├── 改异步 → asyncio.gather
│   │   └── 加缓存 → Redis
│   ├── 计算慢?
│   │   └── 算法优化 / 用 C 扩展
│   └── 网络慢?
│       └── GZip 压缩 / 减少响应体
\`\`\`

### 64.14 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 不测量就优化 | 盲改,可能改了没用 | 先压测找瓶颈 |
| 优化非瓶颈 | 收益微小 | 80/20 原则,优化耗时最多的 |
| 加缓存没失效策略 | 数据不一致 | 更新时主动删缓存 |
| 异步代码里调同步阻塞 | 阻塞整个事件循环 | I/O 用 async 库 |
| 连接池设太大 | 数据库连接打满 | 不超过 DB max_conn 的 1/3 |
| 过度优化 | 代码复杂,可读性差 | 够用就行,别钻牛角尖 |

> **本章总结**:性能优化是系统工程——先压测找瓶颈,再针对性优化。**数据库(索引、N+1、连接池)、缓存(Redis)、异步(并发 I/O)、限流(令牌桶)、监控(APM、慢查询)** 五大方向。记住:不测量不优化,优化瓶颈而非全盘。整套 FastAPI 教程到此结束,从入门到部署到优化,你已经具备了独立开发生产级 FastAPI 应用的全部知识。`,
  },
];
