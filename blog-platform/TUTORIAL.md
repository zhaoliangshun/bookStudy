# Blog Platform 全栈教程

> 一个用 **FastAPI（后端）+ Next.js（前端）+ MySQL（数据库）** 写的教学博客平台。
> 本教程**重点讲解 FastAPI 后端**，**简讲 Next.js 前端**，适合：
> - 想系统学 FastAPI 的人
> - 想看一个「能跑的全栈项目」长什么样的人
> - 想理解前后端如何联调的人

---

## 目录

- [第一部分：项目概览与启动](#第一部分项目概览与启动)
- [第二部分：FastAPI 后端详解（主菜）](#第二部分fastapi-后端详解主菜)
- [第三部分：Next.js 前端简讲](#第三部分nextjs-前端简讲)
- [第四部分：核心知识点串联](#第四部分核心知识点串联)
- [第五部分：扩展练习](#第五部分扩展练习)

---

# 第一部分：项目概览与启动

## 1.1 这个项目能学到什么

| 模块 | 知识点 |
| --- | --- |
| FastAPI | 应用入口、生命周期、CORS、路由分组、依赖注入、Pydantic 校验、自动文档 |
| 数据库 | SQLAlchemy 2.0 ORM、`Mapped` 注解、1:N / N:M / 自引用关系、连接池 |
| 认证 | bcrypt 密码哈希、JWT 签发与验证、OAuth2 Password Bearer、三级权限 |
| API 设计 | RESTful CRUD、分页、过滤、关键词搜索、权限校验、级联删除 |
| Next.js | App Router、rewrites 同源代理、Auth Context、递归评论树组件 |
| 前后端联调 | 同源代理 + CORS 双保险、token 携带、错误统一处理 |

## 1.2 技术栈

```
后端  Python 3.9+ · FastAPI · SQLAlchemy 2.0 · PyMySQL · bcrypt · python-jose · Pydantic v2
前端  Next.js (App Router) · React 19 · 原生 fetch
数据库 MySQL（utf8mb4）
```

## 1.3 目录结构

```
blog-platform/
├── backend/                      ← FastAPI 后端
│   ├── app/
│   │   ├── main.py               ← 应用入口：创建 app、注册路由、CORS、lifespan
│   │   ├── config.py             ← 配置：Pydantic Settings 读 .env
│   │   ├── database.py           ← engine、SessionLocal、Base
│   │   ├── models.py             ← ORM 模型：5 张表 + 关系
│   │   ├── schemas.py            ← Pydantic schemas：请求/响应数据结构
│   │   ├── security.py           ← 密码哈希 + JWT
│   │   ├── deps.py               ← 依赖注入：get_db / get_current_user / 权限
│   │   └── routers/              ← 路由分组
│   │       ├── auth.py           ← 注册/登录/资料
│   │       ├── posts.py          ← 文章 CRUD + 分页
│   │       ├── comments.py       ← 评论 + 自引用回复
│   │       └── tags.py           ← 标签 CRUD
│   ├── scripts/seed.py           ← 种子数据
│   ├── requirements.txt
│   └── .env.example
├── app/blog/                     ← Next.js 前端（在仓库根的 app/ 下）
│   ├── layout.js                 ← 博客布局 + AuthProvider
│   ├── blog.css                  ← 全局样式
│   ├── _lib/api.js               ← API 客户端封装
│   ├── _lib/auth-context.jsx     ← 全局登录态
│   ├── _components/              ← Header、CommentTree
│   ├── page.js                   ← 首页
│   ├── login/  register/         ← 认证页
│   ├── posts/                    ← 列表 / 详情 / 编辑 / 新建
│   ├── tags/  me/                ← 标签页 / 用户中心
└── README.md
```

## 1.4 启动步骤

### 第 0 步：准备 MySQL

```sql
CREATE DATABASE blog_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
账号 `root`、密码 `123456`（已在代码默认值里，可改 `.env`）。

### 第 1 步：启动后端

```bash
cd blog-platform/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # 按需改配置
python -m scripts.seed --yes    # 建表 + 灌入演示数据
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

打开：
- http://127.0.0.1:8000/ —— 健康检查
- http://127.0.0.1:8000/docs —— **Swagger UI（在线试调，强烈推荐）**
- http://127.0.0.1:8000/redoc —— ReDoc 文档

### 第 2 步：启动前端

```bash
cd /Users/test/bookStudy
npm install
npm run dev                    # 默认 http://localhost:3000
```

打开 http://localhost:3000/blog 即可。测试账号：

| 角色 | 用户名 | 密码 |
| --- | --- | --- |
| 管理员 | `admin` | `admin123` |
| 普通用户 | `alice` | `alice123` |
| 普通用户 | `bob` | `bob123` |

---

# 第二部分：FastAPI 后端详解（主菜）

> 本部分按「数据从哪来、请求怎么走」的顺序讲解，建议配合 `app/` 下的源码一起看。

## 2.1 FastAPI 是什么，为什么选它

FastAPI 是基于 Python 类型注解的现代 Web 框架，核心特点：

1. **快**：基于 Starlette + Pydantic，性能在 Python 框架里名列前茅。
2. **类型驱动**：你写类型注解，框架自动做请求校验、响应序列化、文档生成。
3. **自动文档**：启动后 `/docs` 就有可交互的 Swagger UI，省掉手写接口文档。
4. **异步原生**：支持 `async def`，适合 IO 密集场景（本项目用同步也够）。
5. **依赖注入**：`Depends()` 是一等公民，写认证、DB 会话非常优雅。

和 Flask 比：FastAPI 自带类型校验和文档；和 Django 比：FastAPI 更轻、只管 API 层。

## 2.2 应用入口 `main.py`

`main.py` 是整个后端的「装配车间」，做四件事：建表、创建 app、加 CORS、注册路由。

### 2.2.1 lifespan：替代已弃用的 on_event

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)   # 启动时建表（已存在则跳过）
    yield                                     # ← app 运行期间
    # yield 之后是关闭逻辑（本项目无需特殊处理）

app = FastAPI(title="Blog Platform API", lifespan=lifespan)
```

**原理**：
- 旧 API `@app.on_event("startup")` 已弃用，官方推荐用 `lifespan` 上下文管理器。
- `yield` 之前 = 启动逻辑，`yield` 之后 = 关闭逻辑（如关连接池、刷缓存）。
- `create_all` 只建不存在的表，**不会改已有表结构**。生产环境改用 Alembic 做迁移，因为加字段、改类型 `create_all` 做不到。

### 2.2.2 CORS 中间件

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,   # ["http://localhost:3000", ...]
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=False,
)
```

**为什么需要 CORS**：浏览器同源策略会拦截跨域请求。前端 `localhost:3000` → 后端 `127.0.0.1:8000` 端口不同 = 跨域。`CORSMiddleware` 在响应头加上 `Access-Control-Allow-Origin`，浏览器才放行。

> 本项目还用了 Next.js `rewrites` 同源代理，前端实际是同源请求，CORS 是「双保险」。两者都配上，单独跑后端测也行，走代理也行。

### 2.2.3 路由注册

```python
app.include_router(auth.router, prefix="/api/blog")
app.include_router(posts.router, prefix="/api/blog")
app.include_router(comments.router, prefix="/api/blog")
app.include_router(tags.router, prefix="/api/blog")
```

每个 router 内部还有自己的 `prefix`（如 `auth.router` 的 prefix 是 `/auth`），最终拼成 `/api/blog/auth/...`。统一前缀方便前端代理和权限管理。

## 2.3 配置管理 `config.py`

```python
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

    DATABASE_URL: str = "mysql+pymysql://root:123456@127.0.0.1:3306/blog_platform?charset=utf8mb4"
    JWT_SECRET: str = "dev-only-secret-please-change-in-production-32chars"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 720
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

@lru_cache
def get_settings() -> Settings:
    return Settings()
```

**关键点**：
1. **配置优先级**：环境变量 > `.env` 文件 > 代码默认值。生产部署只改环境变量，不动代码。
2. **`BaseSettings` 自动类型转换**：`JWT_EXPIRE_MINUTES` 在 `.env` 里是字符串 `"720"`，Pydantic 自动转成 `int`；类型不对直接报错，启动就暴露问题。
3. **`@lru_cache`**：`Settings()` 每次实例化都要读 `.env` + 校验，有点开销。加缓存后整个进程只创建一次，后续 `get_settings()` 返回同一个实例。测试时用 `get_settings.cache_clear()` 重置。

## 2.4 数据库连接 `database.py`

```python
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,            # 调试时改 True 可看每条 SQL
    pool_pre_ping=True,    # 取连接前先 ping，防失效连接
    pool_recycle=3600,     # 每 3600 秒回收，比 MySQL 的 wait_timeout 短
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()
```

### 核心概念：ORM 与 Session

- **ORM（对象关系映射）**：数据库的表对应 Python 的类，行对应对象。我们操作对象，ORM 翻译成 SQL。好处是不拼 SQL 字符串、自动参数化防注入、切换数据库改动小。
- **engine**：连接池 + DBAPI 的封装，所有 SQL 最终走它。
- **Session**：工作单元，一次会话里的所有操作共享一个事务。`commit()` 提交、`rollback()` 回滚、用完必须 `close()` 否则连接泄漏。
- **sessionmaker**：Session 工厂，预先绑好 engine，省得每次手写 `bind=engine`。

### 三个连接池参数为什么这么配

- `pool_pre_ping=True`：MySQL 默认空闲 8 小时会断开连接，连接池里可能存着已断的连接，取出来用就报 `MySQL server has gone away`。`pre_ping` 每次取连接前发个 ping，断了就换一条。
- `pool_recycle=3600`：主动回收，比 MySQL 的 `wait_timeout` 短，避免拿到快过期的连接。
- `pool_size=10, max_overflow=20`：连接池 10 条，突发可溢出到 30 条。

## 2.5 ORM 模型 `models.py`（重头戏）

本项目的 5 张表覆盖了三种最常见的关系：

```
User 1───N Post            （一个用户写多篇文章）
User 1───N Comment         （一个用户发多条评论）
Post 1───N Comment         （一篇文章有多条评论）
Comment 1───N Comment      （一条评论有多条回复，自引用）
Post N───M Tag             （文章与标签多对多，通过 post_tags 关联）
```

### 2.5.1 SQLAlchemy 2.0 风格

```python
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    posts: Mapped[List["Post"]] = relationship(back_populates="author", cascade="all, delete-orphan")
```

**对比旧风格**：旧版用 `Column(Integer, ...)`，2.0 推荐 `Mapped[X]` + `mapped_column(...)`。`Mapped` 类型注解既是给 IDE 看的，也是给 SQLAlchemy 看的——它据此推断列类型。

### 2.5.2 三种关系怎么写

**① 一对多（User → Post）**

```python
# User 侧：「我有多少文章」
posts: Mapped[List["Post"]] = relationship(back_populates="author", cascade="all, delete-orphan")

# Post 侧：「我属于哪个作者」，外键在多的一侧
author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
author: Mapped["User"] = relationship(back_populates="posts", lazy="joined")
```

要点：
- 外键永远在「多」的一侧（Post 里写 `author_id`）。
- `back_populates` 双向绑定：`user.posts` 和 `post.author` 互相联动。
- `cascade="all, delete-orphan"`：删用户时连带删他的文章。
- `lazy="joined"`：查文章时自动 JOIN 作者表，适合「几乎每次查都要作者信息」的场景，避免 N+1 查询。

**② 多对多（Post ↔ Tag）**

```python
# 关联表：只存外键就用 Table，轻量
post_tags = Table(
    "post_tags", Base.metadata,
    Column("post_id", Integer, ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

# Post 侧
tags: Mapped[List["Tag"]] = relationship(secondary=post_tags, back_populates="posts", lazy="selectin")

# Tag 侧
posts: Mapped[List["Post"]] = relationship(secondary=post_tags, back_populates="tags")
```

要点：
- 多对多**必须**借助中间表（关系数据库没法直接表达）。
- `secondary=post_tags` 告诉 SQLAlchemy 用这张关联表。
- `(post_id, tag_id)` 复合主键天然唯一，防止一篇文章重复打同一标签。
- `lazy="selectin"`：用 `SELECT ... WHERE id IN (...)` 一次性把所有标签捞回来，比默认的 `select`（懒加载，每访问一条就查一次）高效。

**③ 自引用（Comment → Comment 回复树）**

```python
parent_id: Mapped[Optional[int]] = mapped_column(ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)

parent: Mapped[Optional["Comment"]] = relationship("Comment", back_populates="replies", remote_side=[id])
replies: Mapped[List["Comment"]] = relationship("Comment", back_populates="parent", cascade="all, delete-orphan", order_by="Comment.created_at")
```

要点：
- `parent_id` 指向同表的主键，`NULL` = 顶级评论，非空 = 回复。
- `remote_side=[id]` 是关键：告诉 SQLAlchemy `parent_id` 是「远端」，`id` 是「近端」，这样自引用才不会歧义。
- 删一条评论，它的所有回复（`cascade`）也会被删。

### 2.5.3 字段设计小贴士

- **密码字段叫 `password_hash` 不叫 `password`**：从命名上提醒自己别存明文。
- **`server_default=func.now()`**：用数据库的 `NOW()`，比 Python 的 `datetime.now()` 更准（多机时钟漂移）。
- **`onupdate=func.now()`**：UPDATE 时自动刷新 `updated_at`。
- **`index=True`**：常用于 `WHERE`、`ORDER BY` 的字段加索引，加速查询。

## 2.6 Pydantic Schemas `schemas.py`

### 2.6.1 为什么 ORM 模型还不够

ORM 描述「数据库里的数据长什么样」，Schema 描述「HTTP 接口收发数据长什么样」。两者职责不同：

- 数据库有 `password_hash`，但响应里**绝不能**返回它。
- 创建用户时要传密码，但响应里不该有密码。
- 不同接口对同一资源结构要求不同（创建时不传 `id`，响应时要带 `id`）。

Pydantic schemas 帮我们做四件事：**自动校验请求体、自动过滤响应字段（白名单）、自动生成 OpenAPI 文档、自动序列化 JSON**。

### 2.6.2 典型示例

```python
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="用户名，3-50 字符")
    email: EmailStr = Field(..., description="邮箱（会被 Pydantic 校验格式）")
    password: str = Field(..., min_length=6, max_length=100, description="密码，6-100 字符")

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)   # ← 允许从 ORM 对象构造
    id: int
    username: str
    email: str
    # 没有 password_hash！白名单机制自动过滤
    created_at: datetime
```

**关键点**：
- `Field(..., min_length=3)`：`...` 表示必填，加长度约束。校验失败 FastAPI 自动返回 422 + 详细错误。
- `EmailStr`：Pydantic 内置邮箱格式校验（依赖 `email-validator` 包）。
- `ConfigDict(from_attributes=True)`：取代旧版的 `orm_mode = True`，允许 `UserOut.model_validate(orm_user)` 从 ORM 对象的属性直接构造。

### 2.6.3 部分更新与递归嵌套

```python
class UserUpdate(BaseModel):
    avatar: str | None = Field(None, max_length=500)   # 所有字段可选 → 支持部分更新
    bio: str | None = Field(None, max_length=1000)

class CommentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    content: str
    author: UserOut                  # ← 嵌套用户 schema
    replies: list["CommentOut"] = [] # ← 递归嵌套：回复也是评论
```

部分更新用 `model_dump(exclude_unset=True)`：只取客户端传了的字段，没传的不动。

> **Python 3.9 兼容性**：`str | None` 是 3.10+ 语法。本项目装了 `eval_type_backport` 让 Pydantic 在 3.9 也能解析；ORM 模型侧则用 `Optional[str]` 更稳。

## 2.7 安全模块 `security.py`

### 2.7.1 密码哈希：为什么用 bcrypt 而不是 MD5/SHA256

```python
def hash_password(plain_password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)              # 每次随机 salt
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    return hashed.decode("utf-8")                 # 形如 '$2b$12$...'

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )
```

**原理对比**：
- **MD5/SHA256** 是「通用哈希」，**速度太快** → 一秒能算几百万次，暴力破解容易。
- **bcrypt** 是「密码哈希」，**刻意做得慢** + 自带 salt + 可调成本因子（`rounds=12` 表示 2^12 次迭代），一秒只能算几十次，专门对抗暴力破解。

**返回值 `$2b$12$...` 拆解**：
- `$2b$` 算法版本
- `12` 成本因子
- 后 22 字符是 salt，31 字符是哈希结果

**验证时为什么不用单独传 salt**：`bcrypt.checkpw` 会从 `hashed_password` 字符串里自动解析出 salt，用同样的 salt 算一遍明文的哈希，再比对。所以每个用户 salt 不同也能正常校验。

### 2.7.2 JWT：无状态认证的原理

```python
def create_access_token(subject: str | int, extra_data: dict | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {
        "sub": str(subject),           # subject：通常是 user_id
        "exp": expire,                 # 过期时间
        "iat": datetime.now(timezone.utc),  # 签发时间
    }
    if extra_data:
        payload.update(extra_data)
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None
```

**JWT 是什么**：JSON Web Token，服务端签名的、自包含的 token。
- **自包含**：token 内部就携带用户信息（`user_id`），不用每次查库。
- **签名**：用 `JWT_SECRET` 签名，伪造不了，验证得了。
- **有过期时间**：泄露了也只用一阵子。

**登录全流程**：
```
客户端 → POST /auth/login {用户名, 密码}
服务端 → 校验密码 → 生成 JWT 返回
客户端 → 把 JWT 存 localStorage → 之后每次请求放 Authorization: Bearer <token>
服务端 → 验证 JWT → 取出 user_id → 知道是谁在请求
```

**HS256 vs RS256**：本项目用 HS256（对称加密，一个密钥既签也验，简单）。生产环境多服务时用 RS256（非对称，私钥签名、公钥验证）。

## 2.8 依赖注入 `deps.py`（FastAPI 的灵魂）

### 2.8.1 什么是依赖注入

一个函数声明它需要什么（参数），由框架负责「注入」。FastAPI 用 `Depends()` 实现。

```python
@router.get("/posts")
def list_posts(
    db: Session = Depends(get_db),                          # 框架注入 DB session
    user: User = Depends(get_current_user),                 # 框架注入当前用户
):
    ...
```

**好处**：复用（写一次到处用）、解耦（路由不关心 db 从哪来）、可测试（测试时替换依赖 mock）、自动文档（依赖里抛的异常反映到 OpenAPI）。

### 2.8.2 yield 依赖：请求级生命周期

```python
def get_db():
    db = SessionLocal()
    try:
        yield db        # ← yield 之前：请求开始，创建 session
    finally:
        db.close()      # ← yield 之后：请求结束，自动关闭
```

`yield` 让函数变成「生成器依赖」，可以做「请求前 + 请求后」逻辑。保证每个请求拿独立 session，且用完必关闭，不泄漏连接。

### 2.8.3 三级权限依赖

```python
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/blog/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_access_token(token)              # 1. 解码 JWT
    if payload is None:
        raise HTTPException(401, "Token 无效或已过期", headers={"WWW-Authenticate": "Bearer"})
    user_id = payload.get("sub")                       # 2. 取 user_id
    user = db.get(User, int(user_id))                  # 3. 查库确认用户存在
    if user is None:
        raise HTTPException(401, "用户不存在")
    if not user.is_active:                             # 4. 检查是否被禁用
        raise HTTPException(403, "用户已被禁用")
    return user

def get_current_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(403, "需要管理员权限")
    return user

def get_current_user_optional(...) -> User | None:
    # auto_error=False：没 token 不报错，返回 None
    ...
```

三级权限：
- `get_current_user`：**必须登录**，否则 401。用于发文章、发评论。
- `get_current_admin`：**必须管理员**，否则 403。用于改/删标签。
- `get_current_user_optional`：**可选登录**，登录了返回 user，没登录返回 None。用于「列表页对游客开放，但登录用户能看到更多」。

**依赖可以链式组合**：`get_current_admin` 依赖 `get_current_user`，`get_current_user` 又依赖 `get_db` 和 `oauth2_scheme`。FastAPI 自动按拓扑顺序解析。

## 2.9 路由 `routers/`

### 2.9.1 认证路由 `auth.py`

注册、登录、获取/更新当前用户、改密码。核心看登录：

```python
@router.post("/login", response_model=TokenOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    # 用户名或邮箱都能登录
    user = db.scalar(
        select(User).where((User.username == payload.username) | (User.email == payload.username))
    )
    # 安全要点：用户名错和密码错的提示一样，避免攻击者据此判断用户名是否存在
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "用户名或密码错误")
    if not user.is_active:
        raise HTTPException(403, "账号已被禁用")
    token = create_access_token(subject=user.id, extra_data={"username": user.username, "is_admin": user.is_admin})
    return TokenOut(access_token=token, user=user)
```

**安全细节**：用户名不存在和密码错误返回**同样的错误信息**「用户名或密码错误」，避免攻击者通过差异提示枚举用户名。

### 2.9.2 文章路由 `posts.py`：分页 + 过滤 + 权限

```python
@router.get("")
def list_posts(
    page: int = Query(1, ge=1, description="页码，从 1 开始"),
    page_size: int = Query(10, ge=1, le=50, description="每页条数，1-50"),
    tag_id: int | None = Query(None, description="按标签 ID 过滤"),
    keyword: str | None = Query(None, description="关键词搜索标题/摘要"),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    # 权限分层：
    #   未登录 → 只看已发布
    #   普通用户 → 已发布 + 自己的草稿
    #   管理员 → 全部
    ...
    # 分页三件套：count 总数 → order_by → offset/limit
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.scalar(count_stmt) or 0
    stmt = stmt.order_by(desc(Post.created_at)).offset((page - 1) * page_size).limit(page_size)
    posts = db.scalars(stmt).unique().all()
    return {"items": ..., "total": total, "page": page, "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size}
```

**知识点**：
- `Query(1, ge=1)`：参数校验，`ge=1` 表示 ≥1。校验失败自动 422。
- **分页响应统一结构** `{items, total, page, page_size, total_pages}`，前端照着渲染页码。
- **总数用子查询算**：`select(func.count()).select_from(stmt.subquery())`，因为原 stmt 带 `selectinload` 等 options，直接 count 会出错。
- **`offset = (page - 1) * page_size`**：页码从 1 开始，offset 从 0 开始。
- **`total_pages` 向上取整**：`(total + page_size - 1) // page_size`，避免 `total=0` 时显示「共 -1 页」。

### 2.9.3 详情页：浏览数 +1 的原子操作

```python
@router.get("/{post_id}", response_model=PostDetailOut)
def get_post(post_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user_optional)):
    post = db.scalar(select(Post).options(...).where(Post.id == post_id))
    if post is None:
        raise HTTPException(404, "文章不存在")
    # 未发布文章只有作者本人和管理员能看
    if not post.is_published and (current_user is None or (current_user.id != post.author_id and not current_user.is_admin)):
        raise HTTPException(404, "文章不存在")
    # 浏览数 +1（原子操作，防并发）
    post.view_count = (post.view_count or 0) + 1
    db.commit()
    ...
```

**为什么不用 `UPDATE ... SET view_count = view_count + 1`**：ORM 写法读出来再写回，并发下可能丢更新（两个请求同时读到 100，都写 101，实际应该是 102）。生产高并发场景应直接发 `UPDATE posts SET view_count = view_count + 1` 原生 SQL，或用 Redis 计数再批量回写。本项目并发量低，ORM 写法够用且代码清晰。

### 2.9.4 评论路由 `comments.py`：自引用回复

```python
@router.get("/post/{post_id}", response_model=list[CommentOut])
def list_comments(post_id: int, db: Session = Depends(get_db)):
    # 只查顶级评论（parent_id IS NULL），replies 会自动递归带出
    comments = db.scalars(
        select(Comment)
        .options(selectinload(Comment.author), selectinload(Comment.replies))
        .where(Comment.post_id == post_id, Comment.parent_id.is_(None))
        .order_by(Comment.created_at)
    ).all()
    return comments
```

**关键**：因为 `Comment.replies` 关系配置了 `selectinload` 和 `cascade`，查顶级评论时 SQLAlchemy 会自动递归把所有回复捞回来，前端拿到的就是一棵完整的评论树。

创建评论时校验「不能回复其他文章的评论」：

```python
if payload.parent_id is not None:
    parent = db.get(Comment, payload.parent_id)
    if parent.post_id != post_id:
        raise HTTPException(400, "不能回复其他文章的评论")
```

### 2.9.5 标签路由 `tags.py`：管理员权限

```python
@router.put("/{tag_id}", response_model=TagOut)
def update_tag(tag_id: int, payload: TagCreate, admin: User = Depends(get_current_admin), db = ...):
    # 只有 admin 能进来——依赖里已经校验过了
    ...
```

`Depends(get_current_admin)` 一行就完成了「必须登录 + 必须是管理员」的权限校验，路由函数本身只关心业务逻辑。这就是依赖注入的优雅之处。

## 2.10 种子数据 `scripts/seed.py`

`seed.py` 用 `drop_all + create_all` 重建表，然后插入演示数据：3 个用户、5 个标签、6 篇文章（含 1 篇草稿）、4 条评论（含 1 条回复）。

**关键技巧**：
- 先 `db.add_all([...])` + `commit()`，再 `refresh()` 拿自增 id。
- 关联对象直接传 ORM 对象（如 `tags=[tag_by_name["前端"]]`），SQLAlchemy 自动处理关联表。
- 草稿（`is_published=False`）用于演示权限分层。

---

# 第三部分：Next.js 前端简讲

> 前端部分只做「简讲」，重点在：**怎么和后端联调**、**怎么管理登录态**、**怎么处理递归结构**。

## 3.1 Next.js App Router 速览

Next.js 13+ 的 App Router 用**文件系统路由**：

```
app/blog/
├── layout.js          ← 布局，子页面共享，路由切换不重新挂载
├── page.js            ← /blog
├── posts/
│   ├── page.js        ← /blog/posts
│   └── [id]/
│       ├── page.js    ← /blog/posts/123（动态路由）
│       └── edit/
│           └── page.js ← /blog/posts/123/edit
├── login/page.js      ← /blog/login
└── ...
```

- `page.js` = 路由页面，`layout.js` = 父级布局。
- `[id]` = 动态段，用 `useParams()` 取值。
- `layout.js` 在路由切换时**不会重新挂载**，所以把 `AuthProvider` 放在 layout 里，登录态能跨页面保留。

## 3.2 前后端联调：rewrites 同源代理

[next.config.mjs](file:///Users/test/bookStudy/next.config.mjs) 里：

```js
async rewrites() {
  return [
    {
      source: "/api/blog/:path*",
      destination: "http://127.0.0.1:8000/api/blog/:path*",
    },
  ];
}
```

**为什么用 rewrites 而不是直接请求后端**：
1. **同源**：浏览器只跟 `localhost:3000` 通信，没有跨域问题。
2. **解耦**：后端地址变了只改这里一处，前端代码不用动。
3. **生产友好**：部署时把 `:8000` 换成内网地址即可。

`:path*` 是通配占位符，`/api/blog/posts/1` 会被转发到 `http://127.0.0.1:8000/api/blog/posts/1`。

## 3.3 API 客户端封装 `_lib/api.js`

把所有后端通信逻辑集中到一个 `blogApi` 对象：

```js
const API_BASE = "/api/blog";   // 走同源代理

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  // body 是对象 → 自动 JSON 序列化
  if (options.body && typeof options.body === "object") {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }
  // 自动带 token
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers, cache: "no-store" });

  // 401 → 清登录态
  if (res.status === 401) {
    clearAuth();
    const err = new Error("未登录或登录已过期");
    err.status = 401;
    throw err;
  }
  if (!res.ok) throw new Error(await parseError(res));
  return res.status === 204 ? null : JSON.parse(await res.text());
}

export const blogApi = {
  auth:    { register, login, me, updateMe },
  posts:   { list, get, create, update, remove },
  comments:{ listByPost, create, update, remove },
  tags:    { list, create, remove },
};
```

**设计要点**：
1. **token 自动带**：登录后所有请求自动加 `Authorization` 头，调用方不用管。
2. **错误统一处理**：401 自动清登录态，其他错误把后端的 `{detail}` 转成可读字符串。
3. **`cache: "no-store"`**：禁用浏览器缓存，每次都拉最新数据（博客内容会变，不能用缓存）。
4. **路径集中**：后端接口改路径只改这一处。

**为什么不用 axios**：原生 `fetch` 够用，少一个依赖。现代浏览器和 Node.js 都支持。

## 3.4 全局登录态 `_lib/auth-context.jsx`

用 React Context + `useState`/`useEffect` 管理登录态：

```jsx
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 进入页面时验证 token
  useEffect(() => {
    async function init() {
      const token = getToken();
      const stored = getStoredUser();
      if (stored) setUser(stored);              // 先用缓存避免闪烁
      if (!token) { setLoading(false); return; }
      try {
        const fresh = await blogApi.auth.me();  // 有 token 就验证 + 拿最新信息
        setUser(fresh);
        setAuth(token, fresh);
      } catch {
        clearAuth();                            // token 失效，清掉
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await blogApi.auth.login({ username, password });
    setAuth(data.access_token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const value = { user, loading, isLogin: !!user, isAdmin: !!user?.is_admin, login, logout, register, updateUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) throw new Error("useAuth 必须在 <AuthProvider> 内部使用");
  return ctx;
}
```

**关键设计**：
1. **Provider 放在 `layout.js`**：路由切换时 layout 不重新挂载，登录态跨页面保留。如果在 page 里包，每次跳转都重新初始化，会丢登录态。
2. **首屏防闪烁**：先用 `localStorage` 缓存的 user 填上，再异步验证。避免未登录用户也看到「登录中...」一闪而过。
3. **`useAuth` 必须在 Provider 内用**：否则抛错，早暴露问题。

## 3.5 递归评论树 `_components/CommentTree.jsx`

评论可以回复评论，回复也是评论，理论上无限嵌套。用递归组件最自然：

```jsx
export default function CommentTree({ comment, postId, currentUserId, isAdmin, onChanged }) {
  const [replying, setReplying] = useState(false);

  async function handleReply(e) {
    e.preventDefault();
    await blogApi.comments.create(postId, { content: replyContent, parent_id: comment.id });
    setReplying(false);
    await onChanged();     // 通知父组件重新加载
  }

  return (
    <li className="comment-item">
      <div className="comment-header">...{comment.author.username}...</div>
      <div className="comment-content">{comment.content}</div>
      <div className="comment-actions">
        {currentUserId && <button onClick={() => setReplying(!replying)}>💬 回复</button>}
        {canDelete && <button onClick={handleDelete}>🗑️ 删除</button>}
      </div>

      {replying && <form onSubmit={handleReply}>...</form>}

      {/* 递归渲染回复 */}
      {comment.replies?.length > 0 && (
        <ul className="comment-list comment-replies">
          {comment.replies.map((r) => (
            <CommentTree key={r.id} comment={r} postId={postId}
              currentUserId={currentUserId} isAdmin={isAdmin} onChanged={onChanged} />
          ))}
        </ul>
      )}
    </li>
  );
}
```

**递归组件三要素**：
1. **基础情况**：`comment.replies?.length > 0` 为假时不再递归。
2. **递归调用**：在 `replies.map` 里再次渲染 `<CommentTree />`。
3. **props 透传**：`postId`、`currentUserId`、`isAdmin`、`onChanged` 一路传下去。

`onChanged` 回调让子组件触发父组件重新加载数据，避免把状态提升到评论树内部（评论树只管渲染，数据由父页面管）。

## 3.6 博客页面滚动覆盖（CSS 小坑）

教程页面用「固定视口 + 内部 `.content` 滚动」布局，`globals.css` 里有全局：

```css
html, body { height: 100%; overflow: hidden; }
```

这会锁死博客页面的 body 滚动。修复在 [app/blog/blog.css](file:///Users/test/bookStudy/app/blog/blog.css#L18-L22) 开头覆盖：

```css
html, body {
  height: auto !important;
  overflow: visible !important;
}
```

`!important` 确保压过 `globals.css`，且 `blog.css` 加载顺序在后，不影响教程页面。

---

# 第四部分：核心知识点串联

## 4.1 一次完整请求的生命周期

以「登录用户发评论」为例：

```
1. 浏览器：用户在评论框输入内容点「回复」
2. 前端：blogApi.comments.create(postId, {content, parent_id})
   → fetch POST /api/blog/comments?post_id=5  （走 Next.js rewrites）
3. Next.js：rewrites 把 /api/blog/comments → http://127.0.0.1:8000/api/blog/comments
4. FastAPI：
   a. CORSMiddleware 处理跨域头
   b. 路由匹配 → comments.router
   c. 解析依赖：
      - get_db：创建 Session
      - get_current_user：取 Authorization 头 → 解码 JWT → 查 User
   d. 执行 create_comment：
      - 校验 post_id 存在
      - 校验 parent_id 存在且属于同一篇文章
      - 创建 Comment 对象 → db.add → db.commit → db.refresh
   e. Pydantic 序列化 CommentOut（自动过滤敏感字段）
5. 响应回前端：{id, content, author, created_at, ...}
6. 前端：onChanged() → 重新加载文章 → 评论树重新渲染
7. FastAPI：get_db 的 finally 执行 db.close()，连接归还连接池
```

## 4.2 JWT 认证全流程

```
注册：
  POST /auth/register {username, email, password}
  → 校验用户名/邮箱唯一 → hash_password → 写库 → 返回 UserOut（无密码）

登录：
  POST /auth/login {username, password}
  → 查用户 → verify_password → create_access_token(user_id, {username, is_admin})
  → 返回 {access_token, token_type:"bearer", user}

后续请求：
  前端：headers["Authorization"] = "Bearer " + token
  后端：get_current_user 依赖
    → oauth2_scheme 从 Authorization 头取 token
    → decode_access_token 验签 + 检查过期
    → 取 sub 字段 → db.get(User, user_id)
    → 检查 is_active
    → 返回 User 对象给路由

登出：
  前端 clearAuth() 清 localStorage 即可
  （JWT 是无状态的，后端不存 session，所以「登出」只是前端丢掉 token。
   如果要实现「真正登出」，需要后端维护 token 黑名单或用短期 token + refresh token。）
```

## 4.3 权限控制模型

| 接口 | 依赖 | 效果 |
| --- | --- | --- |
| `GET /posts` | `get_current_user_optional` | 游客看已发布，登录用户看自己草稿，管理员看全部 |
| `POST /posts` | `get_current_user` | 必须登录 |
| `PUT/DELETE /posts/{id}` | `get_current_user` + 业务校验 | 必须登录 + 作者本人或管理员 |
| `POST /tags` | `get_current_user` | 任何登录用户能建标签 |
| `PUT/DELETE /tags/{id}` | `get_current_admin` | 仅管理员 |

**资源所有权校验**（「作者本人或管理员」）写在路由函数里：

```python
if post.author_id != current_user.id and not current_user.is_admin:
    raise HTTPException(403, "无权修改他人文章")
```

## 4.4 数据库关系设计回顾

```
users (1) ──< posts (N) ──< comments (N) ──< comments (N)   ← 自引用回复
  │                │
  │                └──< post_tags >── tags (M)              ← 多对多
  └──< comments (N)
```

**设计原则**：
- 1:N 关系，外键放「多」的一侧。
- N:M 关系，必须建中间表。
- 自引用关系，`parent_id` 指向本表主键，`remote_side` 告诉框架方向。
- 软删除优先于硬删除（用户用 `is_active`，文章用 `is_published`），避免外键级联删除导致的数据丢失。

---

# 第五部分：扩展练习

学完本教程后，建议动手实现以下功能巩固理解：

### 后端练习

1. **软删除**：给 `Post` 加 `deleted_at` 字段，删除时只设时间戳不真删，查询时过滤。
2. **点赞功能**：新增 `likes` 表（user_id + post_id 复合主键），文章详情返回 `like_count`。
3. **refresh token**：登录时同时返回短期 access token（15 分钟）和长期 refresh token（7 天），access token 过期后用 refresh token 换新的。
4. **文章搜索优化**：把 `LIKE` 换成 MySQL 全文索引（`FULLTEXT INDEX` + `MATCH ... AGAINST`）。
5. **限流**：用 `slowapi` 给登录接口加限流（如同一 IP 每分钟最多 5 次），防暴力破解。
6. **Alembic 迁移**：把 `create_all` 换成 Alembic，写一个加字段的迁移脚本。

### 前端练习

1. **乐观更新**：发评论时先在 UI 上显示出来，失败再回滚（参考 todo demo 的实现）。
2. **Markdown 渲染**：文章正文支持 Markdown，用 `react-markdown` 渲染。
3. **服务端组件**：把文章列表页改成 Server Component，首屏直接渲染 HTML（需要把 fetch 改成服务端调用）。
4. **草稿自动保存**：写文章时每 10 秒自动存草稿到后端。

### 全栈练习

1. **WebSocket 实时评论**：用 FastAPI 的 WebSocket 实现新评论实时推送，前端用原生 WebSocket 接收。
2. **图片上传**：文章支持封面图，用 `multipart/form-data` 上传到后端，存本地或 OSS。
3. **部署**：用 Docker Compose 编排 MySQL + FastAPI + Next.js，一键启动。

---

## 附录：常用命令速查

```bash
# 后端
cd blog-platform/backend
uvicorn app.main:app --reload --port 8000      # 启动开发服务器
python -m scripts.seed --yes                    # 灌入种子数据
python -c "from app.database import engine; from app.models import Base; Base.metadata.create_all(engine)"  # 仅建表

# 前端
cd /Users/test/bookStudy
npm run dev                                     # 启动 Next.js

# 数据库
mysql -uroot -p123456
mysql> USE blog_platform;
mysql> SHOW TABLES;
mysql> SELECT * FROM users;
```

## 附录：测试账号

| 角色 | 用户名 | 密码 | 能做什么 |
| --- | --- | --- | --- |
| 管理员 | `admin` | `admin123` | 改/删任意文章、改/删标签、看所有草稿 |
| 普通用户 | `alice` | `alice123` | 写文章、改/删自己的文章、发评论 |
| 普通用户 | `bob` | `bob123` | 同上 |

---

> **学习建议**：先跑起来 → 打开 `/docs` 用 Swagger UI 试每个接口 → 再读 `main.py` → 按依赖关系顺藤摸瓜读到每个 router → 最后看前端怎么调。遇到不懂的概念，回到本教程对应章节看原理。
