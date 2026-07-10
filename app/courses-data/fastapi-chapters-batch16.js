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
# 从 sqlalchemy.orm 导入 DeclarativeBase
from sqlalchemy.orm import DeclarativeBase

# 定义类 Base，继承 DeclarativeBase
class Base(DeclarativeBase):
    # 空操作占位
    pass

# app/models/user.py
# 从 sqlalchemy 导入 String, Boolean
from sqlalchemy import String, Boolean
# 从 sqlalchemy.orm 导入 Mapped, mapped_column, relationship
from sqlalchemy.orm import Mapped, mapped_column, relationship
# 从 app.models.base 导入 Base
from app.models.base import Base

# 定义类 User，继承 Base
class User(Base):
    # 定义变量 __tablename__，赋值为 "users"
    __tablename__ = "users"

    # 字段 id，类型: Mapped[int]，默认值: mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 字段 email，类型: Mapped[str]，默认值: mapped_column(String(255), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    # 字段 hashed_password，类型: Mapped[str]，默认值: mapped_column(String(255))
    hashed_password: Mapped[str] = mapped_column(String(255))
    # 字段 nickname，类型: Mapped[str]，默认值: mapped_column(String(50))
    nickname: Mapped[str] = mapped_column(String(50))
    # 字段 is_admin，类型: Mapped[bool]，默认值: mapped_column(default=False)
    is_admin: Mapped[bool] = mapped_column(default=False)

    # 关系:一个用户有多篇文章、多条评论
    # 字段 posts，类型: Mapped[list["Post"]]，默认值: relationship(back_populates="author", cascade="all, delete-orphan")
    posts: Mapped[list["Post"]] = relationship(back_populates="author", cascade="all, delete-orphan")
    # 字段 comments，类型: Mapped[list["Comment"]]，默认值: relationship(back_populates="author", cascade="all, delete-orphan")
    comments: Mapped[list["Comment"]] = relationship(back_populates="author", cascade="all, delete-orphan")

# app/models/post.py
# 从 sqlalchemy 导入 String, Text, ForeignKey, func
from sqlalchemy import String, Text, ForeignKey, func
# 从 sqlalchemy.orm 导入 Mapped, mapped_column, relationship
from sqlalchemy.orm import Mapped, mapped_column, relationship
# 从 app.models.base 导入 Base
from app.models.base import Base
# 从 sqlalchemy 导入 DateTime
from sqlalchemy import DateTime
# 导入 datetime 模块
import datetime

# 文章和标签是多对多,需要中间表
# 定义变量 post_tags，赋值为 Table(
post_tags = Table(
    # "post_tags", Base.metadata,
    "post_tags", Base.metadata,
    # 调用 Column()
    Column("post_id", ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True),
    # 调用 Column()
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
# )
)

# 定义类 Post，继承 Base
class Post(Base):
    # 定义变量 __tablename__，赋值为 "posts"
    __tablename__ = "posts"

    # 字段 id，类型: Mapped[int]，默认值: mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 字段 title，类型: Mapped[str]，默认值: mapped_column(String(200))
    title: Mapped[str] = mapped_column(String(200))
    # 字段 content，类型: Mapped[str]，默认值: mapped_column(Text)
    content: Mapped[str] = mapped_column(Text)
    # 字段 author_id，类型: Mapped[int]，默认值: mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    # 字段 created_at，类型: Mapped[datetime.datetime]，默认值: mapped_column(DateTime, server_default=func.now())
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())
    # 字段 updated_at，类型: Mapped[datetime.datetime]，默认值: mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # 字段 author，类型: Mapped["User"]，默认值: relationship(back_populates="posts")
    author: Mapped["User"] = relationship(back_populates="posts")
    # 字段 comments，类型: Mapped[list["Comment"]]，默认值: relationship(back_populates="post", cascade="all, delete-orphan")
    comments: Mapped[list["Comment"]] = relationship(back_populates="post", cascade="all, delete-orphan")
    # 字段 tags，类型: Mapped[list["Tag"]]，默认值: relationship(secondary=post_tags, back_populates="posts")
    tags: Mapped[list["Tag"]] = relationship(secondary=post_tags, back_populates="posts")

# app/models/comment.py
# 定义类 Comment，继承 Base
class Comment(Base):
    # 定义变量 __tablename__，赋值为 "comments"
    __tablename__ = "comments"

    # 字段 id，类型: Mapped[int]，默认值: mapped_column(primary_key=True)
    id: Mapped[int] = mapped_column(primary_key=True)
    # 字段 content，类型: Mapped[str]，默认值: mapped_column(Text)
    content: Mapped[str] = mapped_column(Text)
    # 字段 post_id，类型: Mapped[int]，默认值: mapped_column(ForeignKey("posts.id", ondelete="CASCADE"))
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"))
    # 字段 author_id，类型: Mapped[int]，默认值: mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    # 字段 parent_id，类型: Mapped[int | None]，默认值: mapped_column(ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)
    # 字段 created_at，类型: Mapped[datetime.datetime]，默认值: mapped_column(DateTime, server_default=func.now())
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, server_default=func.now())

    # 字段 post，类型: Mapped["Post"]，默认值: relationship(back_populates="comments")
    post: Mapped["Post"] = relationship(back_populates="comments")
    # 字段 author，类型: Mapped["User"]，默认值: relationship(back_populates="comments")
    author: Mapped["User"] = relationship(back_populates="comments")
    # 字段 parent，类型: Mapped["Comment | None"]，默认值: relationship(remote_side=[id], back_populates="replies")
    parent: Mapped["Comment | None"] = relationship(remote_side=[id], back_populates="replies")
    # 字段 replies，类型: Mapped[list["Comment"]]，默认值: relationship(back_populates="parent")
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
# 从 pydantic 导入 BaseModel, EmailStr
from pydantic import BaseModel, EmailStr

# 定义 Pydantic 数据模型 UserCreate，继承 BaseModel
class UserCreate(BaseModel):
    # 字段 email，类型: EmailStr
    email: EmailStr
    # 字段 password，类型: str
    password: str
    # 字段 nickname，类型: str
    nickname: str

# 定义 Pydantic 数据模型 UserOut，继承 BaseModel
class UserOut(BaseModel):
    # 字段 id，类型: int
    id: int
    # 字段 email，类型: EmailStr
    email: EmailStr
    # 字段 nickname，类型: str
    nickname: str
    # 字段 is_admin，类型: bool
    is_admin: bool
    # 定义类 Config
    class Config:
        # 定义变量 from_attributes，赋值为 True
        from_attributes = True

# 定义 Pydantic 数据模型 UserUpdate，继承 BaseModel
class UserUpdate(BaseModel):
    # 字段 nickname，类型: str | None，默认值: None
    nickname: str | None = None
    # 字段 password，类型: str | None，默认值: None
    password: str | None = None

# app/schemas/post.py
# 定义 Pydantic 数据模型 PostCreate，继承 BaseModel
class PostCreate(BaseModel):
    # 字段 title，类型: str
    title: str
    # 字段 content，类型: str
    content: str
    # 字段 tag_ids，类型: list[int]，默认值: []
    tag_ids: list[int] = []

# 定义 Pydantic 数据模型 PostUpdate，继承 BaseModel
class PostUpdate(BaseModel):
    # 字段 title，类型: str | None，默认值: None
    title: str | None = None
    # 字段 content，类型: str | None，默认值: None
    content: str | None = None

# 定义 Pydantic 数据模型 PostOut，继承 BaseModel
class PostOut(BaseModel):
    # 字段 id，类型: int
    id: int
    # 字段 title，类型: str
    title: str
    # 字段 content，类型: str
    content: str
    # 字段 author_id，类型: int
    author_id: int
    # 字段 created_at，类型: datetime
    created_at: datetime
    # 定义类 Config
    class Config:
        # 定义变量 from_attributes，赋值为 True
        from_attributes = True
\`\`\`

### 61.5 JWT 认证

\`\`\`python
# app/core/security.py
# 从 datetime 导入 datetime, timedelta, timezone
from datetime import datetime, timedelta, timezone
# 从 jose 导入 jwt, JWTError
from jose import jwt, JWTError
# 从 passlib.context 导入 CryptContext
from passlib.context import CryptContext
# 从 app.core.config 导入 settings
from app.core.config import settings

# 定义变量 pwd_ctx，赋值为 CryptContext(schemes=["bcrypt"], deprecated="...
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 定义函数 hash_password，返回: str
def hash_password(password: str) -> str:
    # """密码哈希(存数据库)。"""
    """密码哈希(存数据库)。"""
    # 返回 pwd_ctx.hash(password)
    return pwd_ctx.hash(password)

# 定义函数 verify_password，返回: bool
def verify_password(plain: str, hashed: str) -> bool:
    # """校验密码。"""
    """校验密码。"""
    # 返回 pwd_ctx.verify(plain, hashed)
    return pwd_ctx.verify(plain, hashed)

# 定义函数 create_access_token，返回: str
def create_access_token(subject: str, expires_minutes: int | None = None) -> str:
    # """生成 JWT。"""
    """生成 JWT。"""
    # 定义变量 expire，赋值为 datetime.now(timezone.utc) + timedelta(
    expire = datetime.now(timezone.utc) + timedelta(
        # 定义变量 minutes，赋值为 expires_minutes or settings.ACCESS_TOKEN_EXPI...
        minutes=expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    # )
    )
    # 定义字典 payload
    payload = {"sub": subject, "exp": expire}
    # 返回 jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

# 定义函数 decode_token，返回: str | None
def decode_token(token: str) -> str | None:
    # """解析 JWT,返回 subject(用户 id)。"""
    """解析 JWT,返回 subject(用户 id)。"""
    # 尝试执行，捕获异常
    try:
        # 定义变量 payload，赋值为 jwt.decode(token, settings.SECRET_KEY, algori...
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        # 返回 payload.get("sub")
        return payload.get("sub")
    # 捕获 JWTError 异常
    except JWTError:
        # 返回 None
        return None
\`\`\`

### 61.6 依赖注入:当前用户

\`\`\`python
# app/core/deps.py
# 从 fastapi 导入 Depends, HTTPException, status
from fastapi import Depends, HTTPException, status
# 从 fastapi.security 导入 OAuth2PasswordBearer
from fastapi.security import OAuth2PasswordBearer
# 从 sqlalchemy.orm 导入 Session
from sqlalchemy.orm import Session
# 从 app.core.security 导入 decode_token, verify_password
from app.core.security import decode_token, verify_password
# 从 app.crud.user 导入 get_user_by_email
from app.crud.user import get_user_by_email
# 从 app.models.user 导入 User
from app.models.user import User

# 定义变量 oauth2_scheme，赋值为 OAuth2PasswordBearer(tokenUrl="/api/v1/auth/l...
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# 定义函数 get_db，参数: 
def get_db():
    # """数据库 session 依赖。"""
    """数据库 session 依赖。"""
    # 定义变量 db，赋值为 SessionLocal()
    db = SessionLocal()
    # 尝试执行，捕获异常
    try:
        # 生成值: db
        yield db
    # 无论是否异常都执行
    finally:
        # 调用 db.close()
        db.close()

# 定义函数 get_current_user，返回: User
def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_db)) -> User:
    # """从 token 解出当前用户。"""
    """从 token 解出当前用户。"""
    # 定义变量 credentials_error，赋值为 HTTPException(
    credentials_error = HTTPException(
        # 定义变量 status_code，赋值为 status.HTTP_401_UNAUTHORIZED,
        status_code=status.HTTP_401_UNAUTHORIZED,
        # 定义变量 detail，赋值为 "无效的认证凭据",
        detail="无效的认证凭据",
        # 定义字典 headers
        headers={"WWW-Authenticate": "Bearer"},
    # )
    )
    # 定义变量 user_id，赋值为 decode_token(token)
    user_id = decode_token(token)
    # 条件判断：如果 not user_id
    if not user_id:
        # 抛出 credentials_error 异常
        raise credentials_error
    # 定义变量 user，赋值为 db.get(User, int(user_id))
    user = db.get(User, int(user_id))
    # 条件判断：如果 not user
    if not user:
        # 抛出 credentials_error 异常
        raise credentials_error
    # 返回 user
    return user

# 定义函数 get_current_admin，返回: User
def get_current_admin(user: User = Depends(get_current_user)) -> User:
    # """要求当前用户是管理员。"""
    """要求当前用户是管理员。"""
    # 条件判断：如果 not user.is_admin
    if not user.is_admin:
        # 抛出 HTTPException 异常: 403, "需要管理员权限"
        raise HTTPException(403, "需要管理员权限")
    # 返回 user
    return user
\`\`\`

### 61.7 路由层示例:文章

\`\`\`python
# app/api/v1/posts.py
# 从 fastapi 导入 APIRouter, Depends, HTTPException, Query
from fastapi import APIRouter, Depends, HTTPException, Query
# 从 app.core.deps 导入 get_db, get_current_user
from app.core.deps import get_db, get_current_user
# 从 app.models.user 导入 User
from app.models.user import User
# 从 app.schemas.post 导入 PostCreate, PostUpdate, PostOut
from app.schemas.post import PostCreate, PostUpdate, PostOut
# 从 app.services.post_service 导入 PostService
from app.services.post_service import PostService

# 创建 APIRouter 实例，设置路由前缀
router = APIRouter(prefix="/posts", tags=["文章"])

# 定义 GET 路由：访问 / 时触发
@router.get("/", response_model=list[PostOut])
# def list_posts(
def list_posts(
    # 字段 skip，类型: int，默认值: Query(0, ge=0),
    skip: int = Query(0, ge=0),
    # 字段 limit，类型: int，默认值: Query(20, ge=1, le=100),
    limit: int = Query(20, ge=1, le=100),
    # 字段 tag，类型: str | None，默认值: None,
    tag: str | None = None,
    # 定义变量 db，赋值为 Depends(get_db),
    db = Depends(get_db),
# ):
):
    # """文章列表,支持分页和按标签筛选。"""
    """文章列表,支持分页和按标签筛选。"""
    # 定义变量 service，赋值为 PostService(db)
    service = PostService(db)
    # 返回 service.list_posts(skip, limit, tag)
    return service.list_posts(skip, limit, tag)

# 定义 GET 路由：访问 /{post_id} 时触发
@router.get("/{post_id}", response_model=PostOut)
# 定义函数 get_post，参数: post_id: int, db = Depends(get_db)
def get_post(post_id: int, db = Depends(get_db)):
    # 定义变量 service，赋值为 PostService(db)
    service = PostService(db)
    # 定义变量 post，赋值为 service.get_post(post_id)
    post = service.get_post(post_id)
    # 条件判断：如果 not post
    if not post:
        # 抛出 HTTPException 异常: 404, "文章不存在"
        raise HTTPException(404, "文章不存在")
    # 返回 post
    return post

# 定义 POST 路由：访问 / 时触发
@router.post("/", response_model=PostOut, status_code=201)
# def create_post(
def create_post(
    # 字段 post_in，类型: PostCreate,
    post_in: PostCreate,
    # 字段 current_user，类型: User，默认值: Depends(get_current_user),
    current_user: User = Depends(get_current_user),
    # 定义变量 db，赋值为 Depends(get_db),
    db = Depends(get_db),
# ):
):
    # """发布文章,需要登录。"""
    """发布文章,需要登录。"""
    # 定义变量 service，赋值为 PostService(db)
    service = PostService(db)
    # 返回 service.create_post(post_in, current_user.id)
    return service.create_post(post_in, current_user.id)

# 定义 PUT 路由：访问 /{post_id} 时触发
@router.put("/{post_id}", response_model=PostOut)
# def update_post(
def update_post(
    # 字段 post_id，类型: int,
    post_id: int,
    # 字段 post_in，类型: PostUpdate,
    post_in: PostUpdate,
    # 字段 current_user，类型: User，默认值: Depends(get_current_user),
    current_user: User = Depends(get_current_user),
    # 定义变量 db，赋值为 Depends(get_db),
    db = Depends(get_db),
# ):
):
    # """编辑文章,只有作者本人能改。"""
    """编辑文章,只有作者本人能改。"""
    # 定义变量 service，赋值为 PostService(db)
    service = PostService(db)
    # 定义变量 post，赋值为 service.get_post(post_id)
    post = service.get_post(post_id)
    # 条件判断：如果 not post
    if not post:
        # 抛出 HTTPException 异常: 404, "文章不存在"
        raise HTTPException(404, "文章不存在")
    # 条件判断：如果 post.author_id != current_user.id
    if post.author_id != current_user.id:
        # 抛出 HTTPException 异常: 403, "只能编辑自己的文章"
        raise HTTPException(403, "只能编辑自己的文章")
    # 返回 service.update_post(post, post_in)
    return service.update_post(post, post_in)

# 定义 DELETE 路由：访问 /{post_id} 时触发
@router.delete("/{post_id}", status_code=204)
# def delete_post(
def delete_post(
    # 字段 post_id，类型: int,
    post_id: int,
    # 字段 current_user，类型: User，默认值: Depends(get_current_user),
    current_user: User = Depends(get_current_user),
    # 定义变量 db，赋值为 Depends(get_db),
    db = Depends(get_db),
# ):
):
    # """删除文章,作者或管理员可以。"""
    """删除文章,作者或管理员可以。"""
    # 定义变量 service，赋值为 PostService(db)
    service = PostService(db)
    # 定义变量 post，赋值为 service.get_post(post_id)
    post = service.get_post(post_id)
    # 条件判断：如果 not post
    if not post:
        # 抛出 HTTPException 异常: 404, "文章不存在"
        raise HTTPException(404, "文章不存在")
    # 条件判断：如果 post.author_id != current_user.id and not current_user.is_admin
    if post.author_id != current_user.id and not current_user.is_admin:
        # 抛出 HTTPException 异常: 403, "无权删除"
        raise HTTPException(403, "无权删除")
    # 调用 service.delete_post()
    service.delete_post(post)
\`\`\`

### 61.8 业务层示例

\`\`\`python
# app/services/post_service.py
# 从 sqlalchemy.orm 导入 Session
from sqlalchemy.orm import Session
# 从 app.models.post 导入 Post
from app.models.post import Post
# 从 app.models.tag 导入 Tag
from app.models.tag import Tag
# 从 app.schemas.post 导入 PostCreate, PostUpdate
from app.schemas.post import PostCreate, PostUpdate

# 定义类 PostService
class PostService:
    # 定义函数 __init__，参数: self, db: Session
    def __init__(self, db: Session):
        # self.db = db
        self.db = db

    # 定义函数 list_posts，参数: self, skip: int, limit: int, tag: str | None
    def list_posts(self, skip: int, limit: int, tag: str | None):
        # 定义变量 query，赋值为 self.db.query(Post)
        query = self.db.query(Post)
        # 条件判断：如果 tag
        if tag:
            # 定义变量 query，赋值为 query.join(Post.tags).where(Tag.name == tag)
            query = query.join(Post.tags).where(Tag.name == tag)
        # 返回 query.offset(skip).limit(limit).all()
        return query.offset(skip).limit(limit).all()

    # 定义函数 get_post，参数: self, post_id: int
    def get_post(self, post_id: int):
        # 返回 self.db.get(Post, post_id)
        return self.db.get(Post, post_id)

    # 定义函数 create_post，返回: Post
    def create_post(self, post_in: PostCreate, author_id: int) -> Post:
        # 定义变量 post，赋值为 Post(
        post = Post(
            # 定义变量 title，赋值为 post_in.title,
            title=post_in.title,
            # 定义变量 content，赋值为 post_in.content,
            content=post_in.content,
            # 定义变量 author_id，赋值为 author_id,
            author_id=author_id,
        # )
        )
        # 关联标签
        # 条件判断：如果 post_in.tag_ids
        if post_in.tag_ids:
            # 定义变量 tags，赋值为 self.db.query(Tag).filter(Tag.id.in_(post_in....
            tags = self.db.query(Tag).filter(Tag.id.in_(post_in.tag_ids)).all()
            # post.tags = tags
            post.tags = tags
        # 调用 self.db.add()
        self.db.add(post)
        # 调用 self.db.commit()
        self.db.commit()
        # 调用 self.db.refresh()
        self.db.refresh(post)
        # 返回 post
        return post

    # 定义函数 update_post，参数: self, post: Post, post_in: PostUpdate
    def update_post(self, post: Post, post_in: PostUpdate):
        # 遍历 post_in.model_dump(exclude_unset=True).items()，取 field, value
        for field, value in post_in.model_dump(exclude_unset=True).items():
            # 调用 setattr()
            setattr(post, field, value)
        # 调用 self.db.commit()
        self.db.commit()
        # 调用 self.db.refresh()
        self.db.refresh(post)
        # 返回 post
        return post

    # 定义函数 delete_post，参数: self, post: Post
    def delete_post(self, post: Post):
        # 调用 self.db.delete()
        self.db.delete(post)
        # 调用 self.db.commit()
        self.db.commit()
\`\`\`

### 61.9 登录接口

\`\`\`python
# app/api/v1/auth.py
# 从 fastapi 导入 APIRouter, Depends, HTTPException
from fastapi import APIRouter, Depends, HTTPException
# 从 fastapi.security 导入 OAuth2PasswordRequestForm
from fastapi.security import OAuth2PasswordRequestForm
# 从 app.core.deps 导入 get_db
from app.core.deps import get_db
# 从 app.core.security 导入 verify_password, create_access_token
from app.core.security import verify_password, create_access_token
# 从 app.crud.user 导入 get_user_by_email
from app.crud.user import get_user_by_email

# 创建 APIRouter 实例，设置路由前缀
router = APIRouter(prefix="/auth", tags=["认证"])

# 定义 POST 路由：访问 /login 时触发
@router.post("/login")
# 定义函数 login，参数: form: OAuth2PasswordRequestForm = Depends(), db = ...
def login(form: OAuth2PasswordRequestForm = Depends(), db = Depends(get_db)):
    # """用 OAuth2PasswordRequestForm,字段是 username/passwo
    """用 OAuth2PasswordRequestForm,字段是 username/password。"""
    # username 字段实际存的是 email
    # 定义变量 user，赋值为 get_user_by_email(db, form.username)
    user = get_user_by_email(db, form.username)
    # 条件判断：如果 not user or not verify_password(form.password, user.hashed_password)
    if not user or not verify_password(form.password, user.hashed_password):
        # 抛出 HTTPException 异常: 401, "邮箱或密码错误"
        raise HTTPException(401, "邮箱或密码错误")
    # 定义变量 token，赋值为 create_access_token(subject=str(user.id))
    token = create_access_token(subject=str(user.id))
    # 返回 {"access_token": token, "token_type": "bearer"}
    return {"access_token": token, "token_type": "bearer"}
\`\`\`

> 用 \`OAuth2PasswordRequestForm\` 的好处:Swagger UI 会自动生成"Authorize"按钮,可以直接在文档里登录测试。

### 61.10 路由汇总与启动

\`\`\`python
# app/api/v1/router.py
# 从 fastapi 导入 APIRouter
from fastapi import APIRouter
# 从 app.api.v1 导入 auth, users, posts, comments
from app.api.v1 import auth, users, posts, comments

# 创建路由器实例
api_router = APIRouter(prefix="/api/v1")
# 注册路由器 auth.router
api_router.include_router(auth.router)
# 注册路由器 users.router
api_router.include_router(users.router)
# 注册路由器 posts.router
api_router.include_router(posts.router)
# 注册路由器 comments.router
api_router.include_router(comments.router)

# app/main.py
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 app.api.v1.router 导入 api_router
from app.api.v1.router import api_router
# 从 app.core.config 导入 settings
from app.core.config import settings

# 创建 FastAPI 应用实例
app = FastAPI(title=settings.APP_NAME)
# 注册路由器 api_router
app.include_router(api_router)
\`\`\`

### 61.11 错误处理与文档

\`\`\`python
# 全局异常处理
# 从 fastapi 导入 Request
from fastapi import Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse

# 装饰器：app.exception_handler
@app.exception_handler(Exception)
# 定义异步函数 global_exception_handler，参数: request: Request, exc: Exception
async def global_exception_handler(request: Request, exc: Exception):
    # """兜底未捕获异常,返回 500。"""
    """兜底未捕获异常,返回 500。"""
    # 调用 logger.exception()
    logger.exception("未处理异常")
    # 返回 JSONResponse(status_code=500, content={"detail": "服务器内部错误"})
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
# query {
query {
  # 调用 post()
  post(id: 1) {
    # title
    title
    # author {
    author {
      # nickname
      nickname
    # }
    }
    # comments {
    comments {
      # content
      content
      # author {
      author {
        # nickname
        nickname
      # }
      }
    # }
    }
  # }
  }
# }
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
# 安装 Python 包: strawberry-graphql[fastapi]
pip install strawberry-graphql[fastapi]
\`\`\`

### 62.4 定义 Schema:type

Schema 是 GraphQL 的"数据合同",定义有哪些类型和字段:

\`\`\`python
# app/graphql/schema.py
# 导入 strawberry 模块
import strawberry
# 从 typing 导入 Optional
from typing import Optional

# 类型定义,类似 Pydantic 但用 @strawberry.type
# 装饰器：strawberry.type
@strawberry.type
# 定义类 User
class User:
    # 字段 id，类型: int
    id: int
    # 字段 email，类型: str
    email: str
    # 字段 nickname，类型: str
    nickname: str

# 装饰器：strawberry.type
@strawberry.type
# 定义类 Comment
class Comment:
    # 字段 id，类型: int
    id: int
    # 字段 content，类型: str
    content: str
    # 字段 author，类型: "User"
    author: "User"

# 装饰器：strawberry.type
@strawberry.type
# 定义类 Post
class Post:
    # 字段 id，类型: int
    id: int
    # 字段 title，类型: str
    title: str
    # 字段 content，类型: str
    content: str
    # 字段 author，类型: "User"
    author: "User"
    # 字段 comments，类型: list["Comment"]
    comments: list["Comment"]

    # resolver:关联字段怎么取
    # 装饰器：strawberry.field
    @strawberry.field
    # 定义函数 comments，返回: list["Comment"]
    def comments(self) -> list["Comment"]:
        # 这里查数据库,返回评论列表
        # 从 app.crud.comment 导入 get_comments_by_post
        from app.crud.comment import get_comments_by_post
        # 定义变量 db_comments，赋值为 get_comments_by_post(self.id)
        db_comments = get_comments_by_post(self.id)
        # 返回 [Comment(id=c.id, content=c.content, author=User(...)) for c in db_comments]
        return [Comment(id=c.id, content=c.content, author=User(...)) for c in db_comments]
\`\`\`

### 62.5 Query:查询入口

\`\`\`python
# app/graphql/queries.py
# 导入 strawberry 模块
import strawberry
# 从 app.graphql.schema 导入 User, Post
from app.graphql.schema import User, Post
# 从 app.crud.user 导入 get_user as crud_get_user
from app.crud.user import get_user as crud_get_user
# 从 app.crud.post 导入 get_post as crud_get_post
from app.crud.post import get_post as crud_get_post
# 从 app.core.deps 导入 get_db
from app.core.deps import get_db

# 装饰器：strawberry.type
@strawberry.type
# 定义类 Query
class Query:
    # 装饰器：strawberry.field
    @strawberry.field
    # 定义函数 user，返回: User | None
    def user(self, id: int) -> User | None:
        # """查单个用户。"""
        """查单个用户。"""
        # 定义变量 db，赋值为 next(get_db())
        db = next(get_db())
        # 定义变量 u，赋值为 crud_get_user(db, id)
        u = crud_get_user(db, id)
        # 条件判断：如果 not u
        if not u:
            # 返回 None
            return None
        # 返回 User(id=u.id, email=u.email, nickname=u.nickname)
        return User(id=u.id, email=u.email, nickname=u.nickname)

    # 装饰器：strawberry.field
    @strawberry.field
    # 定义函数 post，返回: Post | None
    def post(self, id: int) -> Post | None:
        # """查单个文章。"""
        """查单个文章。"""
        # 定义变量 db，赋值为 next(get_db())
        db = next(get_db())
        # 定义变量 p，赋值为 crud_get_post(db, id)
        p = crud_get_post(db, id)
        # 条件判断：如果 not p
        if not p:
            # 返回 None
            return None
        # 返回 Post(id=p.id, title=p.title, content=p.content)
        return Post(id=p.id, title=p.title, content=p.content)
\`\`\`

**注意**:\`@strawberry.field\` 装饰器的方法就是 resolver,客户端查到这个字段时,会调这个方法取数据。

### 62.6 Mutation:修改入口

\`\`\`python
# app/graphql/mutations.py
# 导入 strawberry 模块
import strawberry
# 从 app.graphql.schema 导入 Post
from app.graphql.schema import Post
# 从 app.services.post_service 导入 PostService
from app.services.post_service import PostService

# 装饰器：strawberry.type
@strawberry.type
# 定义类 Mutation
class Mutation:
    # 装饰器：strawberry.mutation
    @strawberry.mutation
    # 定义函数 create_post，返回: Post
    def create_post(self, title: str, content: str, token: str) -> Post:
        # """发布文章。"""
        """发布文章。"""
        # 验证 token,拿用户(简化)
        # 定义变量 user，赋值为 verify_token(token)
        user = verify_token(token)
        # 条件判断：如果 not user
        if not user:
            # 抛出 Exception 异常: "未登录"
            raise Exception("未登录")
        # 定义变量 db，赋值为 next(get_db())
        db = next(get_db())
        # 定义变量 service，赋值为 PostService(db)
        service = PostService(db)
        # 定义变量 post，赋值为 service.create_post(PostCreate(title=title, c...
        post = service.create_post(PostCreate(title=title, content=content), user.id)
        # 返回 Post(id=post.id, title=post.title, content=post.content)
        return Post(id=post.id, title=post.title, content=post.content)
\`\`\`

### 62.7 组装 Schema 并集成到 FastAPI

\`\`\`python
# app/graphql/schema.py(完整)
# 导入 strawberry 模块
import strawberry
# 从 app.graphql.queries 导入 Query
from app.graphql.queries import Query
# 从 app.graphql.mutations 导入 Mutation
from app.graphql.mutations import Mutation

# 定义变量 schema，赋值为 strawberry.Schema(query=Query, mutation=Mutat...
schema = strawberry.Schema(query=Query, mutation=Mutation)

# app/main.py
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 strawberry.fastapi 导入 GraphQLRouter
from strawberry.fastapi import GraphQLRouter

# 创建 FastAPI 应用实例
app = FastAPI()
# 定义变量 graphql_app，赋值为 GraphQLRouter(schema)
graphql_app = GraphQLRouter(schema)
# 注册路由器 graphql_app, prefix="/graphql"
app.include_router(graphql_app, prefix="/graphql")
\`\`\`

访问 \`http://localhost:8000/graphql\`,会看到 GraphQL Playground / Apollo Sandbox,可以直接写查询测试。

### 62.8 客户端怎么查

\`\`\`graphql
# 查文章详情(只要标题和作者昵称)
# query {
query {
  # 调用 post()
  post(id: 1) {
    # title
    title
    # author {
    author {
      # nickname
      nickname
    # }
    }
  # }
  }
# }
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
# 从 strawberry.fastapi 导入 GraphQLRouter
from strawberry.fastapi import GraphQLRouter
# 从 fastapi 导入 Request
from fastapi import Request

# 定义异步函数 get_context，参数: request: Request
async def get_context(request: Request):
    # """从请求里取出 token,放进 context。"""
    """从请求里取出 token,放进 context。"""
    # 定义变量 token，赋值为 request.headers.get("Authorization", "").repl...
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    # 返回 {"token": token, "user": verify_token(token)}
    return {"token": token, "user": verify_token(token)}

# 定义变量 graphql_app，赋值为 GraphQLRouter(schema, context_getter=get_cont...
graphql_app = GraphQLRouter(schema, context_getter=get_context)
# 注册路由器 graphql_app, prefix="/graphql"
app.include_router(graphql_app, prefix="/graphql")

# resolver 里用 info.context 拿
# 装饰器：strawberry.type
@strawberry.type
# 定义类 Query
class Query:
    # 装饰器：strawberry.field
    @strawberry.field
    # 定义函数 me，返回: User | None
    def me(self, info) -> User | None:
        # 定义变量 user，赋值为 info.context.get("user")
        user = info.context.get("user")
        # 条件判断：如果 not user
        if not user:
            # 抛出 Exception 异常: "未登录"
            raise Exception("未登录")
        # 返回 User(id=user.id, ...)
        return User(id=user.id, ...)
\`\`\`

### 62.10 N+1 问题与 DataLoader

GraphQL 的杀手锏"按需取关联数据"也带来坑:**N+1 查询**。

\`\`\`python
# 危险:列表查 10 篇文章,每篇又查一次作者,共 11 次 SQL
# 装饰器：strawberry.field
@strawberry.field
# 定义函数 author，返回: "User"
def author(self) -> "User":
    # 定义变量 db，赋值为 next(get_db())
    db = next(get_db())
    a = db.get(User, self.author_id)   # 每篇文章查一次!
    # 返回 User(...)
    return User(...)
\`\`\`

**解法**:用 \`DataLoader\` 批量取:

\`\`\`python
# 从 strawberry.dataloader 导入 DataLoader
from strawberry.dataloader import DataLoader

# 定义异步函数 load_users，返回: list[User]
async def load_users(user_ids: list[int]) -> list[User]:
    # """一次查所有用户,而不是一个个查。"""
    """一次查所有用户,而不是一个个查。"""
    # 定义变量 db，赋值为 next(get_db())
    db = next(get_db())
    # 定义变量 users，赋值为 db.query(User).filter(User.id.in_(user_ids))....
    users = db.query(User).filter(User.id.in_(user_ids)).all()
    # 定义字典 user_map
    user_map = {u.id: u for u in users}
    # 返回 [user_map.get(uid) for uid in user_ids]
    return [user_map.get(uid) for uid in user_ids]

# 用时
# 定义变量 user_loader，赋值为 DataLoader(load_fn=load_users)
user_loader = DataLoader(load_fn=load_users)

# 装饰器：strawberry.field
@strawberry.field
# 定义异步函数 author，返回: "User"
async def author(self) -> "User":
    # 定义变量 user，赋值为 await user_loader.load(self.author_id)
    user = await user_loader.load(self.author_id)
    # 返回 User(id=user.id, ...)
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
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建 FastAPI 应用实例
app = FastAPI(title="用户服务")

# 定义 GET 路由：访问 /users/{user_id} 时触发
@app.get("/users/{user_id}")
# 定义函数 get_user，参数: user_id: int
def get_user(user_id: int):
    # 返回 {"id": user_id, "nickname": "小明", "email": "xm@example.com"}
    return {"id": user_id, "nickname": "小明", "email": "xm@example.com"}

# order_service/app/main.py(订单服务)
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 导入 httpx 模块
import httpx

# 创建 FastAPI 应用实例
app = FastAPI(title="订单服务")

USER_SERVICE_URL = "http://user-service:8001"   # 用户服务地址

# 定义 GET 路由：访问 /orders/{order_id} 时触发
@app.get("/orders/{order_id}")
# 定义异步函数 get_order，参数: order_id: int
async def get_order(order_id: int):
    # 先查订单(模拟)
    # 定义字典 order
    order = {"id": order_id, "user_id": 1, "amount": 99.9}
    # 再调用户服务查用户信息
    # async with httpx.AsyncClient() as client:
    async with httpx.AsyncClient() as client:
        # 定义变量 r，赋值为 await client.get(f"{USER_SERVICE_URL}/users/{...
        r = await client.get(f"{USER_SERVICE_URL}/users/{order['user_id']}")
        # 定义变量 user，赋值为 r.json()
        user = r.json()
    # 返回 {"order": order, "user": user}
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
# 从 fastapi 导入 FastAPI, Request, HTTPException
from fastapi import FastAPI, Request, HTTPException
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse
# 导入 httpx 模块
import httpx

# 创建 FastAPI 应用实例
app = FastAPI(title="API 网关")

# 定义字典 SERVICES
SERVICES = {
    # "users": "http://user-service:8001",
    "users": "http://user-service:8001",
    # "orders": "http://order-service:8002",
    "orders": "http://order-service:8002",
    # "products": "http://product-service:8003",
    "products": "http://product-service:8003",
# }
}

# 装饰器：app.api_route
@app.api_route("/{service}/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
# 定义异步函数 gateway，参数: service: str, path: str, request: Request
async def gateway(service: str, path: str, request: Request):
    # 条件判断：如果 service not in SERVICES
    if service not in SERVICES:
        # 抛出 HTTPException 异常: 404, "未知服务"
        raise HTTPException(404, "未知服务")
    # 这里省略 token 校验
    # 定义变量 target，赋值为 f"{SERVICES[service]}/{path}"
    target = f"{SERVICES[service]}/{path}"
    # async with httpx.AsyncClient() as client:
    async with httpx.AsyncClient() as client:
        # 定义变量 r，赋值为 await client.request(
        r = await client.request(
            # request.method, target,
            request.method, target,
            # 定义变量 params，赋值为 request.query_params,
            params=request.query_params,
            headers={"X-User-Id": "1"},   # 传给后端
        # )
        )
        # 返回 JSONResponse(content=r.json(), status_code=r.status_code)
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
# 导入 consul 模块
import consul
# 定义变量 c，赋值为 consul.Consul()
c = consul.Consul()

# 注册
# c.agent.service.register(
c.agent.service.register(
    # 定义变量 name，赋值为 "user-service",
    name="user-service",
    # 定义变量 address，赋值为 "10.0.0.5",
    address="10.0.0.5",
    # 定义变量 port，赋值为 8001,
    port=8001,
    # 定义变量 check，赋值为 consul.Check.http("http://10.0.0.5:8001/healt...
    check=consul.Check.http("http://10.0.0.5:8001/health", "10s")
# )
)

# 发现
# _, services = c.health.service("user-service", pas
_, services = c.health.service("user-service", passing=True)
# 定义列表 addresses
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
# pip install opentelemetry-instrumentation-fastapi
pip install opentelemetry-instrumentation-fastapi

# 启动时初始化
# 从 opentelemetry 导入 trace
from opentelemetry import trace
# 从 opentelemetry.sdk.trace 导入 TracerProvider
from opentelemetry.sdk.trace import TracerProvider
# 从 opentelemetry.exporter.jaeger.thrift 导入 JaegerExporter
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
# 从 opentelemetry.sdk.trace.export 导入 BatchSpanProcessor
from opentelemetry.sdk.trace.export import BatchSpanProcessor
# 从 opentelemetry.instrumentation.fastapi 导入 FastAPIInstrumentor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

# 调用 trace.set_tracer_provider()
trace.set_tracer_provider(TracerProvider())
# 定义变量 jaeger_exporter，赋值为 JaegerExporter(agent_host_name="jaeger", agen...
jaeger_exporter = JaegerExporter(agent_host_name="jaeger", agent_port=6831)
# 调用 trace.get_tracer_provider()
trace.get_tracer_provider().add_span_processor(
    # 调用 BatchSpanProcessor()
    BatchSpanProcessor(jaeger_exporter)
# )
)

# 创建 FastAPI 应用实例
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
# 定义 Pydantic 数据模型 UserCreate，继承 BaseModel
class UserCreate(BaseModel):
    # 字段 email，类型: str
    email: str
    # 字段 password，类型: str
    password: str
    # 字段 nickname，类型: str
    nickname: str
    created_at: datetime   # 不该让客户端传!
    is_admin: bool        # 不该让客户端传!

# ✅ 入参只要必要的
# 定义 Pydantic 数据模型 UserCreate，继承 BaseModel
class UserCreate(BaseModel):
    # 字段 email，类型: EmailStr
    email: EmailStr
    # 字段 password，类型: str
    password: str
    # 字段 nickname，类型: str
    nickname: str
\`\`\`

**响应模型别返回整个 ORM 对象**:

\`\`\`python
# ❌ 返回所有字段(含 hashed_password)
# 定义 GET 路由：访问 /users 时触发
@app.get("/users", response_model=list[User])
# 定义函数 list_users，参数: 
def list_users(): ...

# ✅ 只返回该给前端的字段
# 定义 GET 路由：访问 /users 时触发
@app.get("/users", response_model=list[UserOut])
# 定义函数 list_users，参数: 
def list_users(): ...
\`\`\`

> Pydantic v2 比 v1 快 5-50 倍,务必用 v2。

### 64.3 数据库优化:索引

慢查询最常见的原因是**没加索引**:

\`\`\`python
# ❌ 没索引,查 email 要全表扫描
# 字段 email，类型: Mapped[str]，默认值: mapped_column(String(255))
email: Mapped[str] = mapped_column(String(255))

# ✅ 加索引,查询走 B+ 树
# 字段 email，类型: Mapped[str]，默认值: mapped_column(String(255), index=True)
email: Mapped[str] = mapped_column(String(255), index=True)
# 唯一索引(也带索引功能)
# 字段 email，类型: Mapped[str]，默认值: mapped_column(String(255), unique=True)
email: Mapped[str] = mapped_column(String(255), unique=True)

# 组合索引(常用查询条件组合)
# 定义变量 __table_args__，赋值为 (
__table_args__ = (
    # 调用 Index()
    Index("idx_user_status", "user_id", "status"),
# )
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
# 定义变量 posts，赋值为 db.query(Post).limit(10).all()
posts = db.query(Post).limit(10).all()
# 遍历 posts，取 post
for post in posts:
    print(post.author.nickname)   # 每次访问 author 都查一次!

# ✅ eager loading:1 次查文章 + 1 次查作者,共 2 次
# 从 sqlalchemy.orm 导入 selectinload
from sqlalchemy.orm import selectinload
# 定义变量 posts，赋值为 db.query(Post).options(selectinload(Post.auth...
posts = db.query(Post).options(selectinload(Post.author)).limit(10).all()
# 遍历 posts，取 post
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
# 导入 redis.asyncio 并重命名为 redis
import redis.asyncio as redis
# 导入 json 模块
import json
# 从 functools 导入 wraps
from functools import wraps

# 定义变量 redis_client，赋值为 redis.from_url("redis://localhost:6379")
redis_client = redis.from_url("redis://localhost:6379")

# 定义异步函数 get_or_set，参数: key: str, ttl: int, fetch_func
async def get_or_set(key: str, ttl: int, fetch_func):
    # """缓存模式:先查 Redis,没有再查数据库,查完写回。"""
    """缓存模式:先查 Redis,没有再查数据库,查完写回。"""
    # 定义变量 cached，赋值为 await redis_client.get(key)
    cached = await redis_client.get(key)
    # 条件判断：如果 cached
    if cached:
        # 返回 json.loads(cached)
        return json.loads(cached)
    # 缓存没有,查数据库
    # 定义变量 data，赋值为 await fetch_func()
    data = await fetch_func()
    # 写回缓存,TTL 秒后过期
    # await redis_client.setex(key, ttl, json.dumps(data
    await redis_client.setex(key, ttl, json.dumps(data))
    # 返回 data
    return data

# 定义 GET 路由：访问 /posts/hot 时触发
@app.get("/posts/hot")
# 定义异步函数 hot_posts，参数: 
async def hot_posts():
    # 定义异步函数 fetch，参数: 
    async def fetch():
        # 查数据库
        # 定义变量 db，赋值为 next(get_db())
        db = next(get_db())
        # 返回 [p.title for p in db.query(Post).order_by(Post.views.desc()).limit(10).all()]
        return [p.title for p in db.query(Post).order_by(Post.views.desc()).limit(10).all()]
    # 返回 await get_or_set("hot_posts", ttl=300, fetch_func=fetch)
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
# 定义函数 fetch_all，参数: 
def fetch_all():
    a = requests.get("https://api.a.com").json()  # 1 秒
    b = requests.get("https://api.b.com").json()  # 1 秒
    c = requests.get("https://api.c.com").json()  # 1 秒
    return [a, b, c]  # 总共 3 秒

# ✅ 异步:三个请求并发,1 秒
# 导入 asyncio 模块
import asyncio
# 导入 httpx 模块
import httpx

# 定义异步函数 fetch_all，参数: 
async def fetch_all():
    # async with httpx.AsyncClient() as client:
    async with httpx.AsyncClient() as client:
        # 定义列表 tasks
        tasks = [
            # 调用 client.get()
            client.get("https://api.a.com"),
            # 调用 client.get()
            client.get("https://api.b.com"),
            # 调用 client.get()
            client.get("https://api.c.com"),
        # ]
        ]
        # 定义变量 responses，赋值为 await asyncio.gather(*tasks)
        responses = await asyncio.gather(*tasks)
        return [r.json() for r in responses]  # 总共 1 秒
\`\`\`

> 关键:**异步不是让单个请求更快,而是让单 worker 同时处理更多请求**。

### 64.7 连接池

每次请求都建数据库连接很慢(握手开销),用连接池复用:

\`\`\`python
# 从 sqlalchemy 导入 create_engine
from sqlalchemy import create_engine

# 定义变量 engine，赋值为 create_engine(
engine = create_engine(
    # "mysql://...",
    "mysql://...",
    pool_size=10,        # 常驻连接数
    max_overflow=20,     # 突发可多开
    pool_pre_ping=True,   # 用前 ping 一下,避免拿到断的连接
    pool_recycle=3600,    # 连接每小时回收,防数据库踢
# )
)
\`\`\`

> 连接池大小别瞎设:太小请求排队,太大数据库扛不住。一般 \`pool_size + max_overflow\` 不超过数据库 \`max_connections\` 的 1/3。

### 64.8 中间件优化:GZip

响应体大时开 GZip 压缩,减少传输:

\`\`\`python
# 从 fastapi.middleware.gzip 导入 GZipMiddleware
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)   # 大于 1KB 才压
\`\`\`

> JSON 接口开了 GZip,响应能小 70%,移动端尤其受益。

### 64.9 限流保护:令牌桶

高并发下保护后端,超出的请求直接拒绝:

\`\`\`python
# 简化版令牌桶限流(生产用 slowapi 库)
# 导入 time 模块
import time

# 定义类 TokenBucket
class TokenBucket:
    # 定义函数 __init__，参数: self, rate: int, capacity: int
    def __init__(self, rate: int, capacity: int):
        self.rate = rate          # 每秒生成令牌数
        self.capacity = capacity  # 桶容量
        # self.tokens = capacity
        self.tokens = capacity
        # self.last_time = time.monotonic()
        self.last_time = time.monotonic()

    # 定义函数 allow，返回: bool
    def allow(self) -> bool:
        # 定义变量 now，赋值为 time.monotonic()
        now = time.monotonic()
        # 定义变量 elapsed，赋值为 now - self.last_time
        elapsed = now - self.last_time
        # 按时间补令牌
        # self.tokens = min(self.capacity, self.tokens + ela
        self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)
        # self.last_time = now
        self.last_time = now
        # 条件判断：如果 self.tokens >= 1
        if self.tokens >= 1:
            # self.tokens -= 1
            self.tokens -= 1
            # 返回 True
            return True
        # 返回 False
        return False

bucket = TokenBucket(rate=100, capacity=200)   # 100 QPS,突发 200

# 定义 GET 路由：访问 /api 时触发
@app.get("/api")
# 定义函数 api，参数: 
def api():
    # 条件判断：如果 not bucket.allow()
    if not bucket.allow():
        # 抛出 HTTPException 异常: 429, "请求太频繁"
        raise HTTPException(429, "请求太频繁")
    # 返回 {"msg": "ok"}
    return {"msg": "ok"}
\`\`\`

> 生产推荐用 \`slowapi\` 库,内置 FastAPI 集成。

### 64.10 监控定位瓶颈

不知道哪慢,优化无从谈起。几个监控手段:

**1. 慢查询日志**

\`\`\`sql
-- MySQL 开启慢查询日志,超过 1 秒的 SQL 记下来
-- SET GLOBAL slow_query_log = ON;
SET GLOBAL slow_query_log = ON;
-- SET GLOBAL long_query_time = 1;
SET GLOBAL long_query_time = 1;
\`\`\`

**2. APM(应用性能监控)**

\`\`\`python
# 用 Sentry / New Relic / Datadog
# 自动记录每个请求耗时,慢的标红
# 导入 sentry_sdk 模块
import sentry_sdk
# 调用 sentry_sdk.init()
sentry_sdk.init(dsn="...", traces_sample_rate=0.1)
\`\`\`

**3. 自定义计时**

\`\`\`python
# 导入 time 模块
import time
# 导入 logging 模块
import logging

# 定义变量 logger，赋值为 logging.getLogger("perf")
logger = logging.getLogger("perf")

# 定义 GET 路由：访问 /slow 时触发
@app.get("/slow")
# 定义函数 slow_api，参数: 
def slow_api():
    # 定义变量 t0，赋值为 time.perf_counter()
    t0 = time.perf_counter()
    # 定义变量 db_result，赋值为 query_db()
    db_result = query_db()
    # 定义变量 t1，赋值为 time.perf_counter()
    t1 = time.perf_counter()
    # 调用 logger.info()
    logger.info(f"DB 查询耗时 {(t1-t0)*1000:.1f}ms")
    # 定义变量 process_result，赋值为 process(db_result)
    process_result = process(db_result)
    # 定义变量 t2，赋值为 time.perf_counter()
    t2 = time.perf_counter()
    # 调用 logger.info()
    logger.info(f"处理耗时 {(t2-t1)*1000:.1f}ms")
    # 返回 process_result
    return process_result
\`\`\`

### 64.11 压测工具

优化前后要量化对比,用压测工具:

**locust(Python,可写脚本)**:

\`\`\`python
# locustfile.py
# 从 locust 导入 HttpUser, task, between
from locust import HttpUser, task, between

# 定义类 ApiUser，继承 HttpUser
class ApiUser(HttpUser):
    wait_time = between(1, 3)   # 每个用户每 1-3 秒发一次

    # 装饰器：task
    @task
    # 定义函数 get_posts，参数: self
    def get_posts(self):
        # 调用 self.client.get()
        self.client.get("/api/v1/posts/")

    @task(2)   # 权重 2,发两倍频率
    # 定义函数 get_users，参数: self
    def get_users(self):
        # 调用 self.client.get()
        self.client.get("/api/v1/users/")
\`\`\`

\`\`\`bash
# locust -f locustfile.py
locust -f locustfile.py
# 打开 http://localhost:8089,设并发数,开始压测
\`\`\`

**wrk(简单快速)**:

\`\`\`bash
# 100 并发,持续 30 秒
# wrk -t4 -c100 -d30s http://localhost:8000/api/v1/p
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
