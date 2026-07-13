// =============================================================
// FastAPI 应用开发实战教程 - 第 14 批章节（项目结构与配置 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-architecture : 项目分层架构
//   fa-config       : 配置管理
//   fa-logging      : 日志与监控
//   fa-lifespan     : 生命周期与启动任务
// ============================================================

export const chapters = [
  // =============================================================
  // 第一章：项目分层架构
  // =============================================================
  {
    id: 'fa-architecture',
    group: '项目结构与配置',
    icon: '🏗️',
    title: '项目分层架构',
    content: `## 项目分层架构

### 1.1 为什么需要项目结构

教程里为了演示方便，所有代码都堆在一个 \`main.py\` 里。这在 demo 阶段没问题，但真实项目一旦这么做，很快就会变成噩梦：

- **文件膨胀**：一个 \`main.py\` 几千行，找个接口要滚半天；
- **协作冲突**：两个人同时改 \`main.py\`，git 合并冲突不断；
- **职责混乱**：路由、数据库、业务逻辑、校验全搅在一起，改一处怕动到另一处；
- **无法复用**：同样的业务逻辑想给别的接口用，没法 import；
- **测试困难**：逻辑全绑在路由里，想单独测业务函数测不了。

> 解决方案就一个字：**分层**。让代码各司其职，每层只做自己该做的事。

### 1.2 单文件 vs 多文件 vs 模块化

项目结构演化通常经历三个阶段，理解这个演化过程，你才能知道当前项目该用哪种。

**阶段一：单文件**

\`\`\`python
# main.py —— 所有东西都在一个文件
# 从 fastapi 导入 FastAPI 应用类
from fastapi import FastAPI
# 导入 Python 标准库的 sqlite3 模块（轻量级数据库，无需安装服务）
import sqlite3

# 创建 FastAPI 应用实例
app = FastAPI()

# 用装饰器注册 GET 路由，{user_id} 是路径参数
@app.get("/users/{user_id}")
# user_id: int 表示路径参数会被自动转成整数类型
def get_user(user_id: int):
    # 路由 + 数据库查询 + 业务逻辑 全混在一起（反模式！）
    # 每次请求都连接数据库，没有连接池，效率低
    conn = sqlite3.connect("test.db")
    # 执行 SQL 查询，用 ? 占位符防 SQL 注入
    cursor = conn.execute("SELECT * FROM users WHERE id=?", (user_id,))
    # fetchone() 取第一条匹配记录，没有则返回 None
    row = cursor.fetchone()
    # 关闭连接（忘了关就泄漏，但异常时这行可能执行不到）
    conn.close()
    # 查不到就返回错误
    if not row:
        return {"error": "not found"}
    # row[0] 是 id 列，row[1] 是 name 列（按索引取值，不直观）
    return {"id": row[0], "name": row[1]}
\`\`\`

适合：一个 demo、一个练习、几十行代码的玩具项目。一旦超过 200 行就该考虑拆分。

**阶段二：多文件**

把不同职责拆到不同文件，但还在同一个目录：

\`\`\`
myapp/
  main.py        # 入口 + 路由
  models.py      # 数据库模型
  schemas.py     # Pydantic 模型
  database.py    # 数据库连接
\`\`\`

适合：中小项目（接口数 < 30）。能撑一阵子，但接口一多 \`main.py\` 又会膨胀。

**阶段三：模块化**

按业务模块组织，每个模块内部自成一体：

\`\`\`
myapp/
  app/
    main.py
    core/           # 公共配置
    users/          # 用户模块
      router.py
      service.py
      models.py
    posts/          # 文章模块
      router.py
      service.py
      models.py
\`\`\`

适合：中大型项目（接口数 > 30，多人协作）。这是本节要重点讲的结构。

> 怎么选？不要一上来就搞最复杂的模块化结构。**先用单文件跑通，再按需要拆**。过早设计结构和过早优化一样，都是坑。

### 1.3 经典分层架构

Web 后端有个公认的分层模式，从上到下：

\`\`\`
HTTP 请求
    ↓
┌─────────────┐
│  路由层 api  │  接收请求、参数校验、调 service、组装响应
└─────────────┘
    ↓
┌─────────────┐
│ 业务层 service│  真正的业务逻辑（算钱、扣库存、发邮件）
└─────────────┘
    ↓
┌──────────────┐
│ 数据层 repository│  只管增删改查，不懂业务（也叫 crud / dao）
└──────────────┘
    ↓
┌─────────────┐
│ 模型层 model │  定义表结构（ORM）
└─────────────┘
\`\`\`

**每一层的职责边界**：

- **路由层（Router/API）**：只负责 HTTP 协议相关的事——接收请求、参数校验、调用 service、把结果组装成 HTTP 响应。**绝对不写业务逻辑**，不直接操作数据库。
- **业务层（Service）**：项目的核心，所有业务规则都在这。比如"下单要扣库存、扣余额、生成订单号"。**不碰 HTTP**（不返回 JSON、不读 request），也**不直接写 SQL**。
- **数据访问层（Repository/CRUD）**：只管数据的增删改查，是 service 和数据库之间的桥。**不懂业务**——它只知道"根据 id 查用户"，不知道"为什么要查"。
- **模型层（Model）**：纯定义数据结构，用 ORM（如 SQLAlchemy）描述表。

**为什么要这么分？** 三个理由：

1. **可测试**：service 不依赖 HTTP，可以直接单元测试，不用启动整个 app；
2. **可替换**：今天用 SQLite，明天换 PostgreSQL，只改 repository 层，service 不动；
3. **职责清晰**：出 bug 时一眼知道该去哪层查——返回格式错看 api 层，业务逻辑错看 service 层，SQL 错看 repository 层。

### 1.4 按功能分模块 vs 按层分目录

有两种主流组织方式，先看代码再讲怎么选。

**按层分目录（layer-first）**：所有路由放一起，所有 service 放一起。

\`\`\`
app/
  routers/
    user.py
    post.py
    comment.py
  services/
    user.py
    post.py
    comment.py
  repositories/
    user.py
    post.py
    comment.py
  models/
    user.py
    post.py
\`\`\`

**按功能分模块（feature-first）**：每个业务模块内部包含自己的各层。

\`\`\`
app/
  users/
    router.py
    service.py
    repository.py
    models.py
  posts/
    router.py
    service.py
    repository.py
    models.py
\`\`\`

**怎么选？**

- 项目小（< 5 个模块）：按层分更直观，文件少好找；
- 项目大、多人协作：按功能分更好——改"用户"功能只动 \`users/\` 目录，不碰别人，git 冲突少；
- 绝大多数真实项目推荐 **feature-first**。

> 经验法则：当你发现改一个功能要在四五个目录间跳来跳去时，就该从 layer-first 切到 feature-first 了。

### 1.5 APIRouter 路由拆分

前面一直在用 \`@app.get(...)\`，所有路由都挂在 \`app\` 上。接口一多，\`main.py\` 就爆炸。**APIRouter** 就是用来拆路由的——它是一个"小号 app"，可以独立定义路由，最后统一挂到 app 上。

### Demo 1：第一个 APIRouter

\`\`\`python
# 文件：app/users/router.py
from fastapi import APIRouter  # 导入 APIRouter，它是一个路由容器

# 创建一个路由器实例，后续的路由都注册到它上面
# 注意：这里先不加 prefix，等会演示在 include_router 时统一加
router = APIRouter()

# 用 @router.get 而不是 @app.get 注册路由
# 这条路由的完整路径会在挂载时决定
@router.get("/list")
def list_users():
    """获取用户列表"""
    # 这里返回假数据，真实项目会调 service 层
    return [
        {"id": 1, "name": "张三"},
        {"id": 2, "name": "李四"},
    ]

@router.get("/{user_id}")
def get_user(user_id: int):
    """根据 id 获取单个用户"""
    return {"id": user_id, "name": "某用户"}
\`\`\`

### Demo 2：在 main.py 挂载路由

\`\`\`python
# 文件：app/main.py
from fastapi import FastAPI
from app.users.router import router as user_router  # 导入子路由

app = FastAPI(title="我的应用")

# 把 user_router 挂到 app 上
# prefix="/users" 表示这个路由器里所有路径前面都会自动加上 /users
# tags=["用户"] 是给 Swagger 文档分组用的，打开 /docs 就能看到分组效果
app.include_router(user_router, prefix="/users", tags=["用户"])

# 现在访问 /users/list 会命中 list_users
# 访问 /users/1 会命中 get_user
\`\`\`

### 1.6 路由前缀和标签

\`prefix\` 和 \`tags\` 是组织大型 API 的两大利器：

- **prefix（前缀）**：给一组路由加统一前缀，避免每个路径都手写 \`/users/xxx\`；
- **tags（标签）**：Swagger 文档里按标签分组展示，接口多的时候一目了然。

**prefix 可以在两处定义**：

\`\`\`python
# 方式一：定义 APIRouter 时就加前缀（推荐，更内聚）
router = APIRouter(prefix="/users", tags=["用户"])

# 方式二：include_router 时加前缀（更灵活，可覆盖）
app.include_router(router)  # 此时不用再写 prefix 了
\`\`\`

> 推荐方式一：前缀和路由定义放一起，看 \`router.py\` 就知道这组路由的完整路径，不用跑去 main.py 翻。

### 1.7 路由的 include_router 组合

一个 app 可以挂多个 router，一个 router 也能被多个 app 挂载（复用）。这就是组合的力量。

### Demo 3：多模块路由组合

\`\`\`python
# 文件：app/posts/router.py
# 从 fastapi 导入 APIRouter 路由容器
from fastapi import APIRouter

# 创建路由器，prefix="/posts" 表示下面所有路径自动加 /posts 前缀
# tags=["文章"] 用于 Swagger 文档分组
router = APIRouter(prefix="/posts", tags=["文章"])

# 注册 GET 路由，路径是 /posts/（前缀 + "/"）
@router.get("/")
def list_posts():
    """文章列表"""
    # 返回假数据，真实项目会调 service 层查数据库
    return [{"id": 1, "title": "Hello"}]

# 注册 POST 路由，路径也是 /posts/（同 URL 不同方法）
@router.post("/")
# payload: dict 表示请求体会被解析成字典（没有校验，真实项目用 Pydantic 模型）
def create_post(payload: dict):
    """创建文章"""
    return {"msg": "创建成功", "data": payload}
\`\`\`

\`\`\`python
# 文件：app/comments/router.py
# 从 fastapi 导入 APIRouter 路由容器
from fastapi import APIRouter

# 前缀里可以带路径参数 {post_id}，这样评论路由天然挂在某篇文章下
# 完整路径示例：/posts/1/comments/（文章 id=1 的评论列表）
router = APIRouter(prefix="/posts/{post_id}/comments", tags=["评论"])

# 注册 GET 路由，完整路径是 /posts/{post_id}/comments/
@router.get("/")
# post_id 从 URL 路径中自动提取，int 类型注解会自动转换
def list_comments(post_id: int):
    """某篇文章的评论列表"""
    return {"post_id": post_id, "comments": []}
\`\`\`

\`\`\`python
# 文件：app/main.py
# 从 fastapi 导入 FastAPI 应用类
from fastapi import FastAPI
# 导入三个子路由模块，用 as 重命名避免冲突
from app.users.router import router as user_router
from app.posts.router import router as post_router
from app.comments.router import router as comment_router

# 创建应用实例，title 会显示在 Swagger 文档页面
app = FastAPI(title="博客系统")

# 一次性挂载所有路由，main.py 只做组装，不含业务
# 因为各 router 已自带 prefix，这里不需要再写 prefix
app.include_router(user_router)       # /users/*
app.include_router(post_router)       # /posts/*
app.include_router(comment_router)    # /posts/{post_id}/comments/*

# 根路径，通常用作健康检查或欢迎页
@app.get("/")
def root():
    return {"msg": "博客系统已启动"}
\`\`\`

### 1.8 依赖在各层的体现

分层不只是文件拆分，**依赖注入**也要配合分层。FastAPI 的 \`Depends\` 让各层解耦。

### Demo 4：分层 + 依赖注入

\`\`\`python
# 文件：app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 数据库连接 URL（真实项目从配置读）
SQLALCHEMY_DATABASE_URL = "sqlite:///./blog.db"

# 创建引擎，connect_args 是 SQLite 专用参数
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# 会话工厂，每次调用 SessionLocal() 产生一个新会话
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 所有模型的基类
Base = declarative_base()

# 依赖函数：每个请求拿一个独立数据库会话，用完关闭
def get_db():
    db = SessionLocal()        # 请求开始：创建会话
    try:
        yield db               # 把会话交给路由用
    finally:
        db.close()             # 请求结束：无论成功失败都关闭
\`\`\`

\`\`\`python
# 文件：app/users/repository.py
from sqlalchemy.orm import Session

# 数据访问层：只管 CRUD，不写业务逻辑
def get_user(db: Session, user_id: int):
    """根据 id 查用户"""
    # 这里用伪代码，真实项目会用 ORM 模型
    return db.execute(
        "SELECT * FROM users WHERE id = :uid",
        {"uid": user_id}
    ).fetchone()

def list_users(db: Session, skip: int = 0, limit: int = 20):
    """查用户列表，支持分页"""
    return db.execute(
        "SELECT * FROM users LIMIT :limit OFFSET :skip",
        {"limit": limit, "skip": skip}
    ).fetchall()
\`\`\`

\`\`\`python
# 文件：app/users/service.py
from sqlalchemy.orm import Session
from app.users.repository import get_user as repo_get_user

# 业务层：写业务规则，调 repository，不碰 HTTP
def get_user_detail(db: Session, user_id: int):
    """获取用户详情，带业务校验"""
    user = repo_get_user(db, user_id)  # 调数据层
    if not user:
        # 业务层抛业务异常，不返回 HTTP 响应
        raise ValueError(f"用户 {user_id} 不存在")
    return user
\`\`\`

\`\`\`python
# 文件：app/users/router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.users.service import get_user_detail

router = APIRouter(prefix="/users", tags=["用户"])

# 路由层：只做 HTTP 适配，业务交给 service
@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    try:
        user = get_user_detail(db, user_id)  # 调业务层
        return {"user": user}
    except ValueError as e:
        # 把业务异常转成 HTTP 404
        raise HTTPException(status_code=404, detail=str(e))
\`\`\`

> 注意调用方向：**router → service → repository**，绝不反过来。下层永远不知道上层存在，这是分层能成立的关键。

### 1.9 实战：博客系统完整项目结构

把前面所有概念合起来，做一个博客系统的完整结构。

### Demo 5：博客系统完整结构

\`\`\`
blog/
  app/
    __init__.py
    main.py                  # 入口，组装 app
    database.py              # 数据库引擎和会话
    config.py                # 配置（下章详讲）
    core/
      __init__.py
      security.py            # 密码加密、JWT
      deps.py                # 公共依赖（get_current_user 等）
    users/
      __init__.py
      router.py              # 用户相关路由
      service.py             # 用户业务逻辑
      repository.py          # 用户数据访问
      models.py              # 用户 ORM 模型
      schemas.py             # 用户 Pydantic 模型
    posts/
      __init__.py
      router.py
      service.py
      repository.py
      models.py
      schemas.py
    comments/
      __init__.py
      router.py
      service.py
      repository.py
      models.py
      schemas.py
\`\`\`

\`\`\`python
# 文件：app/main.py —— 只做组装，不含业务
from fastapi import FastAPI
# 导入模型基类 Base 和数据库引擎 engine
# Base.metadata 收集了所有 ORM 模型的表定义
from app.database import Base, engine
# 导入三个业务模块的路由器
from app.users.router import router as user_router
from app.posts.router import router as post_router
from app.comments.router import router as comment_router

# 创建表（开发期用，生产用 Alembic 迁移）
# Base.metadata.create_all 会根据所有继承 Base 的模型创建数据库表
# bind=engine 指定用哪个数据库引擎建表
Base.metadata.create_all(bind=engine)

# 创建应用，title 和 version 显示在 Swagger 文档 (/docs)
app = FastAPI(title="博客系统", version="1.0.0")

# 挂载所有子路由
app.include_router(user_router)
app.include_router(post_router)
app.include_router(comment_router)

# tags=["健康检查"] 给这个路由单独打标签，在 Swagger 文档里单独分组
@app.get("/", tags=["健康检查"])
def root():
    return {"status": "ok", "service": "blog"}
\`\`\`

\`\`\`python
# 文件：app/posts/router.py —— 路由层示范
# APIRouter 路由容器、Depends 依赖注入、HTTPException 抛 HTTP 异常
from fastapi import APIRouter, Depends, HTTPException
# Session 是 SQLAlchemy 的数据库会话类型，用于类型注解
from sqlalchemy.orm import Session
# get_db 是依赖函数，每个请求拿一个独立的数据库会话
from app.database import get_db
# 导入 service 层（业务逻辑）和 schemas（Pydantic 模型）
from app.posts import service, schemas

# 创建路由器，所有路径自动加 /posts 前缀
router = APIRouter(prefix="/posts", tags=["文章"])

# response_model=list[schemas.PostOut] 指定响应模型
# FastAPI 会按 PostOut 模型过滤输出字段，多出的字段不返回
# list[...] 表示返回的是一个列表
@router.get("/", response_model=list[schemas.PostOut])
# skip/limit 是查询参数（分页），db 通过 Depends(get_db) 注入
def list_posts(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """文章列表"""
    # 调 service 层，不直接操作数据库
    return service.list_posts(db, skip=skip, limit=limit)

# response_model=schemas.PostOut 指定返回单个文章对象
@router.post("/", response_model=schemas.PostOut)
# post: schemas.PostCreate 是请求体参数，FastAPI 会按 PostCreate 模型校验
def create_post(post: schemas.PostCreate, db: Session = Depends(get_db)):
    """创建文章"""
    return service.create_post(db, post)

# {post_id} 是路径参数
@router.get("/{post_id}", response_model=schemas.PostOut)
def get_post(post_id: int, db: Session = Depends(get_db)):
    """获取单篇文章"""
    # 调 service 层查文章
    post = service.get_post(db, post_id)
    # 查不到就抛 404 异常，FastAPI 自动转成 JSON 响应
    if not post:
        raise HTTPException(404, "文章不存在")
    return post
\`\`\`

### 1.10 常见错误与避坑指南

**错误一：路由层写业务逻辑**

\`\`\`python
# ❌ 反例：路由里直接算钱、查库
@router.post("/order")
def create_order(order: OrderIn, db: Session = Depends(get_db)):
    user = db.query(User).get(order.user_id)   # 业务！
    if user.balance < order.amount:             # 业务！
        raise HTTPException(400, "余额不足")
    user.balance -= order.amount
    db.commit()
    return {"msg": "ok"}

# ✅ 正解：路由只做适配
@router.post("/order")
def create_order(order: OrderIn, db: Session = Depends(get_db)):
    try:
        result = order_service.create(db, order)  # 业务全在 service
        return result
    except InsufficientBalance as e:
        raise HTTPException(400, str(e))
\`\`\`

**错误二：忘记 \`__init__.py\`**：Python 包必须有 \`__init__.py\`（哪怕是空文件），否则 \`from app.users.router import ...\` 会 import 失败。

**错误三：循环导入**：\`models.py\` import \`database.py\`，\`database.py\` 又 import \`models.py\`，启动报错。解法是把 \`Base\` 放在独立的 \`database.py\`，models 只 import \`Base\`。

**错误四：路由路径冲突**：两个 router 都定义了 \`/\`，挂载时前缀不同没事，前缀相同就会冲突。用 \`/docs\` 检查路径是否重复。

**错误五：在 service 层返回 HTTP 响应**：service 里写 \`raise HTTPException\` 会让 service 绑死在 FastAPI 上，没法复用到 CLI 或其他框架。service 应抛业务异常，由 router 转成 HTTP 异常。

**错误六：prefix 重复拼接**：APIRouter 里写了 \`prefix="/users"\`，include_router 时又写了 \`prefix="/users"\`，结果路径变成 \`/users/users/list\`。两者只写一处。

> 一句话总结：**分层的关键不是文件叫什么，而是依赖方向只能从上到下**。router 依赖 service，service 依赖 repository，反过来一行都不行。
`,
  },

  // =============================================================
  // 第二章：配置管理
  // =============================================================
  {
    id: 'fa-config',
    group: '项目结构与配置',
    icon: '⚙️',
    title: '配置管理',
    content: `## 配置管理

### 2.1 为什么不能硬编码

新手最常犯的错：把数据库地址、密钥、端口号直接写在代码里。

\`\`\`python
# ❌ 反例：硬编码
# 创建 FastAPI 应用
app = FastAPI()
# 数据库连接串写死在代码里：换环境就得改代码，密码也暴露在代码中
engine = create_engine("postgresql://user:pass@localhost:5432/mydb")
# 密钥直接写在源码里，一旦提交 git 就等于公开了
SECRET_KEY = "abcdef123456"
\`\`\`

这种写法的问题：

- **换环境要改代码**：本地用 SQLite，上线用 PostgreSQL，难道改代码再提交？
- **密码泄露**：把数据库密码提交到 git，相当于公开了；
- **多人协作冲突**：A 的本地密码和 B 不一样，互相覆盖；
- **无法分环境**：dev / staging / prod 配置全混在一起。

> 正确做法：**配置和代码分离**。代码只读配置，不存配置。配置从环境变量、配置文件来。

### 2.2 pydantic-settings BaseSettings

FastAPI 官方推荐用 \`pydantic-settings\` 管理配置。它让你用 Pydantic 模型定义配置，自动从环境变量读取，还带类型校验。

先装包：

\`\`\`bash
pip install pydantic-settings
\`\`\`

### Demo 1：第一个 Settings 类

\`\`\`python
# 文件：app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """应用配置类，所有配置项集中管理"""
    
    # 应用基本配置
    app_name: str = "我的应用"           # 有默认值，不传就用默认
    debug: bool = False                  # 调试模式，默认关闭
    
    # 数据库配置
    database_url: str = "sqlite:///./app.db"
    
    # 安全配置
    secret_key: str = "change-me-in-prod"  # 生产环境必须改！
    
    # 告诉 pydantic-settings 从 .env 文件读配置
    # env_file=".env" 表示会自动加载同目录下的 .env 文件
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

# 全局单例：整个应用用同一个 settings 实例
settings = Settings()
\`\`\`

\`\`\`python
# 文件：app/main.py
from fastapi import FastAPI
from app.config import settings

# 用配置创建 app
app = FastAPI(title=settings.app_name, debug=settings.debug)

@app.get("/")
def root():
    return {"app": settings.app_name, "debug": settings.debug}
\`\`\`

\`pydantic-settings\` 会按这个顺序找值（后面的覆盖前面）：默认值 < \`.env\` 文件 < 真实环境变量。所以本地开发写 \`.env\`，生产用环境变量，代码完全不用改。

### 2.3 环境变量读取

不写 \`.env\` 也能用，直接在系统环境变量里设。变量名大小写不敏感（默认）。

### Demo 2：纯环境变量驱动

\`\`\`python
# 文件：app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 不设默认值的字段，环境变量里必须有，否则启动报错
    # 这是一种"启动期校验"，少配置直接挂，避免运行到一半才发现
    database_url: str
    
    # 有默认值的，环境变量没设就用默认
    redis_url: str = "redis://localhost:6379/0"
    log_level: str = "INFO"
    
    # 数字类型会自动转换（环境变量都是字符串，pydantic 帮你转）
    port: int = 8000

# 如果没设 DATABASE_URL 环境变量，这一行会直接抛错：
# pydantic_core.ValidationError: 1 validation error for Settings
# database_url: Field required
settings = Settings()
print(settings.port)  # 如果环境变量 PORT=3000，这里就是 3000（int 类型）
\`\`\`

### 2.4 .env 文件管理

\`.env\` 文件是本地开发的标配，把配置写在里面，代码读它。

### Demo 3：.env 文件 + 多字段

\`\`\`bash
# 文件：.env（注意：这个文件绝对不能提交到 git！）
APP_NAME=博客系统
DEBUG=true
DATABASE_URL=postgresql://postgres:123456@localhost:5432/blog
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=my-super-secret-key-12345
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
\`\`\`

\`\`\`python
# 文件：app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "App"
    debug: bool = False
    database_url: str
    redis_url: str = "redis://localhost:6379/0"
    secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        # case_sensitive=False 表示环境变量名大小写不敏感
        case_sensitive=False,
    )

settings = Settings()
# 现在 settings.app_name == "博客系统"
# settings.debug == True（字符串 "true" 自动转 bool）
\`\`\`

### 2.5 .gitignore 必须排除 .env

这一步**极其重要**：

\`\`\`bash
# 文件：.gitignore
.env
.env.*
*.env
\`\`\`

然后提供一个 \`.env.example\` 作为模板（这个要提交）：

\`\`\`bash
# 文件：.env.example（提交到 git，新人照着填）
APP_NAME=博客系统
DEBUG=true
DATABASE_URL=postgresql://user:pass@localhost:5432/blog
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-here
\`\`\`

> 真实事故：某公司把 AWS 密钥提交到 GitHub，被机器人扫到，一晚上被挖矿扣了几万刀。**密钥永远不入库**。

### 2.6 多环境配置（dev、staging、prod）

真实项目至少三套环境：开发、测试、生产。配置各不相同。怎么管？

### Demo 4：多环境配置系统

\`\`\`python
# 文件：app/config.py
import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """基础配置，所有环境共享的默认值放这"""
    app_name: str = "博客系统"
    
    # 数据库
    database_url: str
    redis_url: str = "redis://localhost:6379/0"
    
    # 安全
    secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440
    
    # 日志
    log_level: str = "INFO"
    
    # CORS
    cors_origins: list[str] = ["*"]

class DevSettings(Settings):
    """开发环境配置：覆盖基础配置"""
    debug: bool = True
    log_level: str = "DEBUG"
    # 开发用 SQLite，方便
    database_url: str = "sqlite:///./dev.db"
    secret_key: str = "dev-only-not-secret"
    
    model_config = SettingsConfigDict(env_file=".env.dev")

class ProdSettings(Settings):
    """生产环境配置：严格、安全"""
    debug: bool = False
    log_level: str = "WARNING"
    # 生产必须从环境变量读，不在代码里写死
    cors_origins: list[str] = ["https://blog.example.com"]
    
    model_config = SettingsConfigDict(env_file=".env.prod")

# 根据 ENV 环境变量决定用哪套配置
# 这是一种"工厂模式"：根据条件生产不同的配置实例
def get_settings() -> Settings:
    env = os.getenv("ENV", "dev").lower()  # 默认 dev
    if env == "prod":
        return ProdSettings()   # 生产配置（需设 ENV=prod）
    return DevSettings()        # 默认开发配置

settings = get_settings()
\`\`\`

\`\`\`python
# 文件：app/main.py
from fastapi import FastAPI
# 从 config 模块导入配置实例 settings
from app.config import settings

# 用配置创建 app，title 和 debug 都从配置读
# 这样换环境只改配置，代码完全不用动
app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
)

@app.get("/")
def root():
    # 返回当前配置信息，方便确认运行在哪个环境
    return {"env_debug": settings.debug, "log_level": settings.log_level}
\`\`\`

启动方式：

\`\`\`bash
# 本地开发（默认）
uvicorn app.main:app --reload

# 生产环境
ENV=prod uvicorn app.main:app --host 0.0.0.0 --port 8000
\`\`\`

### 2.7 配置的继承和覆盖

上面的例子已经用了继承。要点：

- 子类覆盖父类字段时，**直接重新赋默认值**；
- \`model_config\` 也会被继承，子类可以指定不同的 \`.env\` 文件；
- 环境变量优先级最高，会覆盖代码里的默认值。

### Demo 5：配置覆盖验证

\`\`\`python
# 演示优先级：代码默认值 < .env 文件 < 系统环境变量
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    name: str = "default-name"  # 第一优先级最低：代码默认值
    model_config = SettingsConfigDict(env_file=".env")

# 场景一：什么都没设 → name == "default-name"
# 场景二：.env 里写了 NAME=from-env → name == "from-env"
# 场景三：系统环境变量 NAME=from-os（即使 .env 也有）→ name == "from-os"

# 这意味着：生产环境你可以在 docker run -e NAME=xxx 时临时覆盖
# 而不用改 .env 文件，运维非常灵活
\`\`\`

### 2.8 配置的类型安全校验

pydantic-settings 的杀手锏：**配置错了，启动就挂**，而不是运行到一半才出问题。

### Demo 6：类型校验避坑

\`\`\`python
from pydantic_settings import BaseSettings
from pydantic import field_validator, HttpUrl

class Settings(BaseSettings):
    database_url: str
    api_url: HttpUrl          # 必须是合法 URL，否则启动报错
    max_connections: int      # 必须是整数
    debug: bool
    
    # 自定义校验：secret_key 长度必须 >= 16
    @field_validator("secret_key")
    @classmethod
    def check_secret_length(cls, v: str) -> str:
        if len(v) < 16:
            raise ValueError("secret_key 太短，至少 16 位")
        return v

# 如果 .env 写了 MAX_CONNECTIONS=abc，启动直接报错：
# Input should be a valid integer [type=int_parsing, input_value='abc']
# 比"运行时才发现连接数是 abc 然后崩"好得多
\`\`\`

### 2.9 敏感信息管理

**原则一：密钥永远不进代码、不进 git。**

\`\`\`python
# ❌ 绝对不要
SECRET_KEY = "hardcoded-secret"

# ✅ 从环境变量读
class Settings(BaseSettings):
    secret_key: str  # 必须由环境变量提供，没有就启动失败
\`\`\`

**原则二：生产环境用密钥管理服务**。AWS Secrets Manager、HashiCorp Vault、阿里云 KMS。代码只负责从这些服务拉密钥。

### Demo 7：从 Vault 拉密钥（伪代码示意思路）

\`\`\`python
import os
import httpx
from pydantic_settings import BaseSettings

def fetch_secret_from_vault(key: str) -> str:
    """从 Vault 拉密钥，而不是写死在代码或 .env"""
    vault_token = os.getenv("VAULT_TOKEN")  # 只有 token 在环境变量
    resp = httpx.get(
        f"http://vault:8200/v1/secret/data/{key}",
        headers={"X-Vault-Token": vault_token},
    )
    resp.raise_for_status()
    return resp.json()["data"]["data"]["value"]

class Settings(BaseSettings):
    # 启动时动态从 Vault 拉取，不存本地
    database_password: str = fetch_secret_from_vault("db_password")
    secret_key: str = fetch_secret_from_vault("app_secret_key")

settings = Settings()
\`\`\`

> 这是高级用法，小项目用 \`.env\` + 环境变量就够了。但要知道生产环境有更安全的方案。

### 2.10 Docker 环境下的配置

Docker 部署时，配置通过 \`docker run -e\` 或 \`docker-compose.yml\` 的 \`environment\` 传入。

### Demo 8：Docker Compose 配置

\`\`\`yaml
# 文件：docker-compose.yml
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      # 直接传环境变量，覆盖 .env
      - ENV=prod
      - DATABASE_URL=postgresql://postgres:secret@db:5432/blog
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=\${SECRET_KEY}   # 从宿主机环境变量读，更安全
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=blog
    volumes:
      - pgdata:/var/lib/postgresql/data
  
  redis:
    image: redis:7

volumes:
  pgdata:
\`\`\`

\`\`\`dockerfile
# 文件：Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# 启动命令，配置全走环境变量
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`

### 2.11 实战：完整的多环境配置系统

把前面所有概念合起来，做一个完整可用的配置系统。

### Demo 9：完整配置系统

\`\`\`python
# 文件：app/config.py
"""完整的多环境配置系统"""
import os
from functools import lru_cache
from typing import Literal
from pydantic import field_validator, HttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """应用配置主类"""
    # —— 环境 ——
    # Literal["dev", "staging", "prod"] 限制 env 只能是这三个值之一
    # 传了其他值 pydantic 会报错，防止拼错环境名
    env: Literal["dev", "staging", "prod"] = "dev"
    debug: bool = False
    
    # —— 应用 ——
    app_name: str = "博客系统"
    app_version: str = "1.0.0"
    
    # —— 数据库 ——
    database_url: str
    db_pool_size: int = 10
    db_max_overflow: int = 20
    
    # —— Redis ——
    redis_url: str = "redis://localhost:6379/0"
    
    # —— 安全 ——
    secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440
    
    # —— CORS ——
    cors_origins: list[str] = ["http://localhost:3000"]
    
    # —— 日志 ——
    log_level: str = "INFO"
    
    # —— 校验 ——
    # @field_validator 是 Pydantic v2 的字段校验装饰器
    # "secret_key" 指定校验哪个字段
    @field_validator("secret_key")
    # @classmethod 表示这是类方法（Pydantic v2 要求）
    @classmethod
    def secret_must_be_long(cls, v: str) -> str:
        # v 是被校验的字段值，校验不通过就 raise ValueError
        if len(v) < 16:
            raise ValueError("secret_key 至少 16 位")
        # 校验通过必须返回 v
        return v

    # mode="before" 表示在 Pydantic 类型转换之前执行
    # 这样能拿到原始的字符串值（还没被尝试转成 list）
    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_cors(cls, v):
        # 允许 .env 里写成逗号分隔字符串：CORS_ORIGINS=http://a.com,http://b.com
        # 如果是字符串就 split 成列表，是列表就直接返回
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

# lru_cache 让 get_settings() 只执行一次，后续都返回同一个实例
# LRU = Least Recently Used，这里实际效果就是"单例缓存"
# 这比全局变量更安全，也方便测试时 override（清除缓存即可）
@lru_cache
def get_settings() -> Settings:
    # 首次调用会解析 .env 和环境变量，后续调用直接返回缓存
    return Settings()

# 提供一个直接可用的实例（兼容老代码）
settings = get_settings()
\`\`\`

\`\`\`python
# 文件：app/main.py
from fastapi import FastAPI, Depends
# CORSMiddleware 是跨域中间件，允许浏览器跨域访问 API
from fastapi.middleware.cors import CORSMiddleware
from app.config import Settings, get_settings

# 工厂函数：根据传入的配置创建 app
# 好处：测试时可以传不同的 settings 创建不同的 app
def create_app(settings: Settings) -> FastAPI:
    """工厂函数：根据配置创建 app"""
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        debug=settings.debug,
    )
    # CORS 配置从配置读
    # allow_origins: 允许哪些域名跨域访问
    # allow_methods=["*"]: 允许所有 HTTP 方法
    # allow_headers=["*"]: 允许所有请求头
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return app

# 用全局配置创建 app
settings = get_settings()
app = create_app(settings)

# 也可以把 settings 做成依赖，方便测试时覆盖
# Depends(get_settings) 会调用 get_settings()（有 lru_cache，只算一次）
@app.get("/info")
def info(settings: Settings = Depends(get_settings)):
    return {"env": settings.env, "app": settings.app_name}
\`\`\`

### 2.12 常见错误与避坑指南

**错误一：在函数内部 new Settings()**

\`\`\`python
# ❌ 每次请求都重新解析一遍配置，慢且浪费
def get_db_url():
    return Settings().database_url

# ✅ 用单例或 lru_cache
settings = Settings()
def get_db_url():
    return settings.database_url
\`\`\`

**错误二：\`.env\` 提交到 git**：一定加 \`.gitignore\`。已经提交了的话，用 \`git rm --cached .env\` 移除，并**立即轮换密钥**（旧的可能已泄露）。

**错误三：bool 类型识别**：\`DEBUG=False\` 在 .env 里，pydantic 会正确转成 \`False\`。但 \`DEBUG=false\`、\`DEBUG=0\`、\`DEBUG=no\` 也会被识别为 False。注意 \`DEBUG="False"\`（带引号）可能被当成字符串再判断，行为依版本而异，最好不写引号。

**错误四：list 类型从 .env 读**：\`cors_origins: list[str]\` 在 .env 里写 \`CORS_ORIGINS=a,b,c\`，需要用 \`mode="before"\` 的 validator 手动 split（见 Demo 9）。否则 pydantic 会尝试把整个字符串当成 list 解析，报错。

**错误五：生产用 dev 配置**：忘了设 \`ENV=prod\`，结果生产跑的是 dev 配置（debug=True、用 SQLite）。启动时打印一行日志确认环境：\`logger.info(f"启动环境: {settings.env}")\`。

**错误六：循环导入**：\`config.py\` 想用 \`database.py\` 的东西，\`database.py\` 又 import \`config.py\` 的 settings。解法：让 \`database.py\` 依赖 \`config.py\`，反过来不行。config 是最底层，不依赖任何业务模块。

> 一句话总结：**配置是代码的"开关"，开关必须在代码外面**。pydantic-settings 给了你类型安全 + 多环境支持，用好它，部署再也不用改代码。
`,
  },

  // =============================================================
  // 第三章：日志与监控
  // =============================================================
  {
    id: 'fa-logging',
    group: '项目结构与配置',
    icon: '📝',
    title: '日志与监控',
    content: `## 日志与监控

### 3.1 为什么用 logging 不用 print

新手调试爱用 \`print\`，但生产环境 \`print\` 几乎没用：

- **没级别**：错误和普通信息混在一起，没法过滤；
- **没时间戳**：出问题时不知道啥时候发生的；
- **没来源**：不知道是哪个文件哪一行打的；
- **没法路由**：想同时输出到文件和控制台？想按级别分文件？print 做不到；
- **没法关**：上线后想把调试信息关掉，print 得一个个删。

> \`logging\` 模块解决所有这些问题。它是 Python 标准库，不用安装。

### 3.2 Python logging 模块基础

logging 有五个核心概念：

- **Logger（记录器）**：你调用的 \`logger.info(...)\` 就是它，入口；
- **Handler（处理器）**：决定日志去哪——控制台、文件、网络；
- **Formatter（格式器）**：决定日志长什么样——时间、级别、消息怎么排；
- **Filter（过滤器）**：精细控制哪些日志要输出；
- **Level（级别）**：DEBUG < INFO < WARNING < ERROR < CRITICAL。

数据流：\`logger.info()\` → Logger 判断级别够不够 → 够了交给 Handler → Handler 再判断级别 → 够了用 Formatter 格式化 → 输出。

### 3.3 日志级别

\`\`\`
DEBUG    (10)  调试细节，生产不开
INFO     (20)  关键流程节点：用户登录、订单创建
WARNING  (30)  异常但能处理：缓存 miss、重试了一次
ERROR    (40)  出错了，但服务还能跑：某个接口报错
CRITICAL (50)  系统级灾难：数据库连不上、磁盘满
\`\`\`

**怎么选级别**？问自己一句："这条日志如果生产环境刷屏，我慌不慌？" 慌就降级，不慌才用 INFO。

### 3.4 在 FastAPI 里用 logging

### Demo 1：基础日志配置

\`\`\`python
# 文件：app/main.py
import logging
from fastapi import FastAPI

# 配置根 logger：级别 INFO，格式含时间、级别、logger 名、消息
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# 给当前模块创建一个 logger，名字通常是 __name__（即 "app.main"）
logger = logging.getLogger(__name__)

app = FastAPI()

@app.get("/")
def root():
    logger.info("访问了根路径")          # 会输出
    logger.debug("这是调试信息")         # 不会输出（级别不够）
    return {"msg": "ok"}

@app.get("/error")
def error():
    logger.error("出错了！")             # 会输出
    return {"msg": "error"}
\`\`\`

运行后控制台：

\`\`\`
2026-07-11 10:00:00 [INFO] app.main: 访问了根路径
2026-07-11 10:00:01 [ERROR] app.main: 出错了！
\`\`\`

### 3.5 日志处理器详解

\`basicConfig\` 是简化版，真实项目要自定义 Handler。

### Demo 2：多 Handler 组合

\`\`\`python
# 文件：app/logging_config.py
import logging
from logging.handlers import RotatingFileHandler

def setup_logging():
    """配置日志系统：控制台 + 滚动文件"""
    
    # 创建根 logger
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)  # 根 logger 设最低级别，具体由 handler 控制
    
    # —— 控制台 Handler：输出 INFO 及以上 ——
    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    console.setFormatter(logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    ))
    logger.addHandler(console)
    
    # —— 滚动文件 Handler：输出所有级别，按大小切分 ——
    # maxBytes=10MB，超过就切；backupCount=5，最多保留 5 个历史文件
    file_handler = RotatingFileHandler(
        "app.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding="utf-8",
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s (%(filename)s:%(lineno)d): %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    ))
    logger.addHandler(file_handler)
    
    # 降低第三方库的日志噪音
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
\`\`\`

三种常用 Handler：

- **StreamHandler**：输出到控制台（stderr），开发期用；
- **FileHandler**：输出到固定文件，简单但文件会无限大；
- **RotatingFileHandler**：按大小滚动，\`maxBytes\` + \`backupCount\`，生产推荐；
- **TimedRotatingFileHandler**：按时间滚动（每天一个文件），审计场景常用。

> 文件日志一定要用滚动版本，否则跑半年一个文件几十 G，连 \`cat\` 都打不开。

### 3.6 结构化日志（JSON 格式）

普通日志是人看的，JSON 日志是机器看的。生产环境用 ELK（Elasticsearch + Logstash + Kibana）或 Loki 收集日志，必须是结构化格式才能查询。

### Demo 3：JSON 结构化日志

\`\`\`python
# 文件：app/logging_config.py
import json
import logging

class JsonFormatter(logging.Formatter):
    """把日志格式化成 JSON，方便日志系统采集"""
    
    def format(self, record: logging.LogRecord) -> str:
        # 构造日志字典
        log_dict = {
            "time": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "line": record.lineno,
        }
        # 如果有异常，加上 traceback
        if record.exc_info:
            log_dict["exception"] = self.formatException(record.exc_info)
        # 把自定义字段加进来（通过 extra 传的）
        for key in ["request_id", "user_id", "method", "path"]:
            if hasattr(record, key):
                log_dict[key] = getattr(record, key)
        return json.dumps(log_dict, ensure_ascii=False)

def setup_json_logging():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    logger.addHandler(handler)
\`\`\`

\`\`\`python
# 使用：通过 extra 传结构化字段
import logging
logger = logging.getLogger(__name__)

@app.get("/users/{user_id}")
def get_user(user_id: int):
    # extra 里的字段会被 JsonFormatter 捞出来放进 JSON
    logger.info("查询用户", extra={"user_id": user_id, "method": "GET", "path": f"/users/{user_id}"})
    return {"id": user_id}

# 输出：
# {"time": "2026-07-11 10:00:00", "level": "INFO", "logger": "app.main", "message": "查询用户", "module": "main", "line": 12, "user_id": 1, "method": "GET", "path": "/users/1"}
\`\`\`

> ELK 里查日志：\`level:ERROR AND user_id:123\`，结构化日志让这种查询成为可能。纯文本日志只能 grep。

### 3.7 request_id 贯穿请求链路

微服务/多日志场景下，一个请求可能经过多个模块。怎么把它们串起来？**给每个请求一个唯一 request_id，所有日志都带上**。

### Demo 4：中间件 + request_id

\`\`\`python
# 文件：app/middleware.py
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

logger = logging.getLogger("app.request")

class RequestIdMiddleware(BaseHTTPMiddleware):
    """给每个请求生成唯一 id，放到 state 里，并加到响应头"""
    
    async def dispatch(self, request: Request, call_next):
        # 生成 request_id，优先用客户端传的，没有就新生成
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())[:8]
        
        # 存到 request.state，路由里能拿到
        request.state.request_id = request_id
        
        # 用 LoggerAdapter 让这个请求内的所有日志自动带 request_id
        # 这样业务代码不用每次手动传 request_id
        adapter = logging.LoggerAdapter(logger, {"request_id": request_id})
        adapter.info(f"请求开始 {request.method} {request.url.path}")
        
        # 调下游
        response = await call_next(request)
        
        # 响应头也带上，方便客户端排查
        response.headers["X-Request-ID"] = request_id
        adapter.info(f"请求结束 {response.status_code}")
        return response
\`\`\`

\`\`\`python
# 文件：app/main.py
import logging
from fastapi import FastAPI, Request
from app.middleware import RequestIdMiddleware
from app.logging_config import setup_json_logging

setup_json_logging()
app = FastAPI()
app.add_middleware(RequestIdMiddleware)

@app.get("/users/{user_id}")
def get_user(user_id: int, request: Request):
    # 从 state 拿 request_id，手动打日志时也能带上
    rid = request.state.request_id
    logging.getLogger("app.api").info(
        f"查询用户 {user_id}",
        extra={"request_id": rid, "user_id": user_id}
    )
    return {"id": user_id, "request_id": rid}
\`\`\`

两次请求的日志：

\`\`\`
{"message":"请求开始 GET /users/1","request_id":"a1b2c3d4",...}
{"message":"查询用户 1","request_id":"a1b2c3d4","user_id":1,...}
{"message":"请求结束 200","request_id":"a1b2c3d4",...}
\`\`\`

用 \`request_id:a1b2c3d4\` 一搜，这个请求的全部日志都出来了。

### 3.8 慢请求监控

接口慢是线上常见问题。用中间件记录每个请求耗时，慢的告警。

### Demo 5：慢请求监控中间件

\`\`\`python
# 文件：app/middleware.py
import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

logger = logging.getLogger("app.slow")

class SlowRequestMiddleware(BaseHTTPMiddleware):
    """记录慢请求，超过阈值告警"""
    
    def __init__(self, app, threshold: float = 1.0):
        super().__init__(app)
        self.threshold = threshold  # 慢请求阈值，单位秒
    
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()  # 高精度计时
        
        try:
            response = await call_next(request)
        except Exception:
            # 请求出异常也要记录耗时
            duration = time.perf_counter() - start
            logger.error(
                f"请求异常 {request.method} {request.url.path} 耗时 {duration:.3f}s",
                exc_info=True,
                extra={"method": request.method, "path": str(request.url.path), "duration": duration}
            )
            raise
        
        duration = time.perf_counter() - start
        
        # 慢请求单独告警
        if duration > self.threshold:
            logger.warning(
                f"慢请求 {request.method} {request.url.path} 耗时 {duration:.3f}s (阈值 {self.threshold}s)",
                extra={
                    "method": request.method,
                    "path": str(request.url.path),
                    "duration": duration,
                    "status": response.status_code,
                }
            )
        else:
            logger.info(
                f"{request.method} {request.url.path} {response.status_code} {duration:.3f}s",
                extra={"method": request.method, "path": str(request.url.path), "duration": duration}
            )
        
        # 响应头加上耗时，前端能看到
        response.headers["X-Response-Time"] = f"{duration:.3f}s"
        return response
\`\`\`

\`\`\`python
# 使用
from app.middleware import SlowRequestMiddleware
app.add_middleware(SlowRequestMiddleware, threshold=0.5)  # 超过 0.5 秒算慢
\`\`\`

### 3.9 Sentry 错误监控集成

日志只能告诉你"出错了"，但错误聚合、堆栈分析、影响范围统计，需要专门的错误监控服务。**Sentry** 是最流行的。

### Demo 6：Sentry 集成

\`\`\`bash
pip install sentry-sdk
\`\`\`

\`\`\`python
# 文件：app/main.py
# 导入 Sentry SDK
import sentry_sdk
# 导入 FastAPI 和 Starlette 的集成模块，让 Sentry 能自动捕获框架异常
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
from fastapi import FastAPI
from app.config import settings

# 初始化 Sentry，DSN 从配置读
# DSN 是 Sentry 项目的接入地址，在 Sentry 后台创建项目时获得
# traces_sample_rate 是性能采样率，1.0=全采样，0.1=采 10%
sentry_sdk.init(
    dsn=settings.sentry_dsn,  # 没配 DSN 就不启用（None 时 Sentry 静默）
    # integrations 列表指定要集成的框架，Sentry 会自动拦截这些框架的异常
    # transaction_style="endpoint" 表示用路由端点名作为事务名
    integrations=[
        StarletteIntegration(transaction_style="endpoint"),
        FastApiIntegration(transaction_style="endpoint"),
    ],
    traces_sample_rate=0.1,        # 性能监控采样 10%
    environment=settings.env,      # 标记环境，Sentry 面板能区分
    send_default_pii=False,        # 不发送个人身份信息（隐私合规）
)

app = FastAPI()

@app.get("/")
def root():
    return {"msg": "ok"}

@app.get("/bug")
def bug():
    # 这个错误会自动上报到 Sentry，同时在本地日志里也能看到
    1 / 0  # 故意触发 ZeroDivisionError
    return {"msg": "never"}

@app.get("/manual-report")
def manual_report():
    # 手动上报：不想抛异常，但想记录到 Sentry
    try:
        # 一些可能失败的操作
        result = do_risky_thing()
    except Exception as e:
        # capture_exception 把异常上报到 Sentry，但不抛出，程序继续运行
        sentry_sdk.capture_exception(e)  # 上报但不抛出
        return {"msg": "降级处理"}
    return {"result": result}
\`\`\`

> Sentry 的价值：同一个错误出现 1000 次，它聚合显示"1 个问题，1000 次发生"，并告诉你第一次和最后一次是什么时候、影响哪些用户。日志里这 1000 条混在一堆，根本看不出来。

### 3.10 实战：生产级日志系统

把前面所有概念合起来，做一个完整的生产级日志系统。

### Demo 7：完整日志系统

\`\`\`python
# 文件：app/logging_config.py
"""生产级日志系统：JSON 格式 + 控制台 + 滚动文件 + request_id"""
import json
import logging
import sys
from logging.handlers import RotatingFileHandler
from app.config import settings

class JsonFormatter(logging.Formatter):
    """JSON 格式化器"""
    def format(self, record: logging.LogRecord) -> str:
        log = {
            "time": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "line": record.lineno,
        }
        if record.exc_info:
            log["exception"] = self.formatException(record.exc_info)
        # 收集所有 extra 字段
        standard = set(vars(record).keys()) - {"msg","args","levelname","levelno","pathname",
            "filename","module","exc_info","exc_text","stack_info","lineno","funcName",
            "created","msecs","relativeCreated","thread","threadName","processName","process",
            "name","message","taskName"}
        for k in standard:
            log[k] = getattr(record, k)
        return json.dumps(log, ensure_ascii=False, default=str)

def setup_logging():
    """初始化日志系统，应在应用启动最早处调用"""
    root = logging.getLogger()
    root.setLevel(settings.log_level)
    # 清掉默认 handler，避免重复输出
    root.handlers.clear()
    
    # 控制台：JSON 格式，方便 docker logs 采集
    console = logging.StreamHandler(sys.stdout)
    console.setFormatter(JsonFormatter(datefmt="%Y-%m-%d %H:%M:%S"))
    console.setLevel(settings.log_level)
    root.addHandler(console)
    
    # 文件：滚动，保留 7 天
    file_h = RotatingFileHandler(
        "logs/app.log",
        maxBytes=50 * 1024 * 1024,  # 50MB
        backupCount=7,
        encoding="utf-8",
    )
    file_h.setFormatter(JsonFormatter(datefmt="%Y-%m-%d %H:%M:%S"))
    file_h.setLevel(logging.DEBUG)  # 文件记全量，便于排查
    root.addHandler(file_h)
    
    # 错误单独一个文件，方便巡检
    err_h = RotatingFileHandler(
        "logs/error.log",
        maxBytes=10 * 1024 * 1024,
        backupCount=10,
        encoding="utf-8",
    )
    err_h.setFormatter(JsonFormatter(datefmt="%Y-%m-%d %H:%M:%S"))
    err_h.setLevel(logging.ERROR)
    root.addHandler(err_h)
    
    # 降低第三方库噪音
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
\`\`\`

\`\`\`python
# 文件：app/main.py
import logging
import time
import uuid
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.logging_config import setup_logging
from app.config import settings

# 必须在创建 app 前初始化日志
setup_logging()
logger = logging.getLogger("app")

app = FastAPI(title=settings.app_name, debug=settings.debug)

# —— 请求日志中间件：request_id + 耗时 + 状态码 ——
class RequestLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:8]
        request.state.request_id = request_id
        start = time.perf_counter()
        
        try:
            response = await call_next(request)
            duration = time.perf_counter() - start
            logger.info(
                f"{request.method} {request.url.path} {response.status_code}",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": str(request.url.path),
                    "status": response.status_code,
                    "duration": round(duration, 3),
                }
            )
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time"] = f"{duration:.3f}s"
            return response
        except Exception:
            duration = time.perf_counter() - start
            logger.error(
                f"请求异常 {request.method} {request.url.path}",
                exc_info=True,
                extra={"request_id": request_id, "method": request.method,
                       "path": str(request.url.path), "duration": round(duration, 3)}
            )
            raise

app.add_middleware(RequestLogMiddleware)

@app.get("/")
def root():
    logger.info("根路径访问")
    return {"status": "ok"}

@app.get("/slow")
def slow():
    import time
    time.sleep(1.5)  # 模拟慢请求
    return {"msg": "slow"}

@app.get("/error")
def error():
    raise RuntimeError("故意出错")
\`\`\`

### 3.11 日志级别选择对照

| 场景 | 推荐级别 | 理由 |
|------|---------|------|
| 用户登录成功 | INFO | 审计需要 |
| 用户登录失败 | WARNING | 可能是攻击 |
| 接口正常调用 | DEBUG（生产关） | 量大，生产开 INFO |
| 缓存 miss | DEBUG | 正常现象，不必 WARNING |
| 重试了一次 | WARNING | 值得关注但能恢复 |
| 第三方 API 超时 | ERROR | 影响功能 |
| 数据库连不上 | CRITICAL | 系统级故障 |
| 定时任务执行 | INFO | 运维需要知道 |

### 3.12 常见错误与避坑指南

**错误一：用 f-string 拼日志**

\`\`\`python
# ❌ 不推荐：即使日志级别不够，f-string 也会执行
logger.debug(f"用户列表: {expensive_query()}")  # 生产 INFO 级别下，expensive_query() 还是会跑！

# ✅ 推荐：用 % 占位符，级别不够时不求值
logger.debug("用户列表: %s", expensive_query)
\`\`\`

**错误二：记敏感信息**：密码、token、身份证号绝对不能进日志。

\`\`\`python
# ❌ 绝对不要
logger.info(f"用户登录: password={password}, token={token}")

# ✅ 脱敏
logger.info("用户登录: user_id=%s", user_id)
\`\`\`

**错误三：根 logger 重复配置**：在多个模块都调 \`basicConfig\` 或 \`addHandler\`，导致同一条日志输出多次。**只在一处初始化日志**（如 \`main.py\` 启动时）。

**错误四：异常没记堆栈**

\`\`\`python
# ❌ 只记了消息，没堆栈，没法排查
try:
    do_something()
except Exception as e:
    logger.error(f"出错了: {e}")

# ✅ 加 exc_info=True 或用 logger.exception
try:
    do_something()
except Exception:
    logger.exception("出错了")  # 自动带完整堆栈
\`\`\`

**错误五：日志文件不滚动**：用 \`FileHandler\` 跑半年，文件几十 G，打开都费劲。一定用 \`RotatingFileHandler\`。

**错误六：日志里打大对象**：\`logger.info(f"响应: {huge_dict}")\` 把整个响应体打出来，日志爆炸。只记关键字段。

> 一句话总结：**日志是生产环境的眼睛**。结构化（JSON）+ request_id 串联 + 级别克制 + 异常带堆栈，这四点做到，线上排查效率翻十倍。
`,
  },

  // =============================================================
  // 第四章：生命周期与启动任务
  // =============================================================
  {
    id: 'fa-lifespan',
    group: '项目结构与配置',
    icon: '🔄',
    title: '生命周期与启动任务',
    content: `## 生命周期与启动任务

### 4.1 什么是生命周期

应用不是"启动就完事"的。很多事要在**启动时**做一次（建连接池、加载模型、预热缓存），也要在**关闭时**做一次（关连接、刷缓冲、通知下游）。这就是"生命周期管理"。

FastAPI（确切说是 Starlette）用 **lifespan** 来处理这件事。它是一个异步上下文管理器，\`yield\` 之前是启动逻辑，\`yield\` 之后是关闭逻辑。

\`\`\`
应用启动
   ↓
执行 lifespan yield 之前的代码（初始化资源）
   ↓
yield —— 应用开始接收请求
   ↓
（应用运行中，处理请求）
   ↓
收到关闭信号（Ctrl+C / SIGTERM）
   ↓
执行 yield 之后的代码（清理资源）
   ↓
应用退出
\`\`\`

### 4.2 旧方式：on_event（已不推荐）

老代码用 \`@app.on_event("startup")\` 和 \`@app.on_event("shutdown")\`：

### Demo 1：旧方式 on_event（了解即可，新代码别用）

\`\`\`python
# 文件：app/main.py
from fastapi import FastAPI

app = FastAPI()

# 启动时执行
@app.on_event("startup")
async def startup():
    # 初始化资源
    print("应用启动，初始化中...")
    app.state.db_pool = ["连接1", "连接2"]  # 假装是连接池

# 关闭时执行
@app.on_event("shutdown")
async def shutdown():
    # 清理资源
    print("应用关闭，清理中...")
    await app.state.db_pool.clear()

@app.get("/")
def root():
    return {"pool_size": len(app.state.db_pool)}
\`\`\`

这种方式有两个问题：

- **启动和关闭逻辑分离**：同一个资源的初始化和清理散在两个函数，维护时容易漏；
- **FastAPI 官方已弃用**：从 0.93 起推荐 lifespan，未来版本可能移除 on_event。

### 4.3 新方式：lifespan（推荐）

### Demo 2：第一个 lifespan

\`\`\`python
# 文件：app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI

# @asynccontextmanager 把一个 async 生成器函数变成异步上下文管理器
# 这就是 lifespan 事件处理器
@asynccontextmanager
async def lifespan(app: FastAPI):
    # —— 启动阶段：yield 之前 ——
    print(">>> 应用启动，初始化资源")
    app.state.db_pool = ["连接1", "连接2"]  # 初始化连接池
    
    yield  # <-- 这里之前是 startup，之后是 shutdown
    
    # —— 关闭阶段：yield 之后 ——
    print(">>> 应用关闭，清理资源")
    app.state.db_pool.clear()  # 清理连接池

# 把 lifespan 传给 FastAPI
app = FastAPI(lifespan=lifespan)

@app.get("/")
def root():
    return {"pool_size": len(app.state.db_pool)}
\`\`\`

启动时控制台：

\`\`\`
>>> 应用启动，初始化资源
INFO:     Uvicorn running on http://127.0.0.1:8000
\`\`\`

按 Ctrl+C 关闭：

\`\`\`
>>> 应用关闭，清理资源
\`\`\`

> lifespan 的核心优势：**一个资源的初始化和清理写在一起**，看一眼就知道这对"开/关"是配对的，不会漏。

### 4.4 为什么用 lifespan 不用 on_event

| 对比项 | on_event | lifespan |
|--------|----------|----------|
| 代码组织 | startup/shutdown 分散 | 同资源的开闭在一起 |
| 官方态度 | 已弃用 | 推荐 |
| 资源传递 | 用 app.state，隐式 | 可在 yield 前初始化，显式 |
| 异常处理 | shutdown 里的异常难捕获 | try/finally 自然包裹 |
| 多资源管理 | 顺序不直观 | 顺序即代码顺序 |

> 结论：新项目一律用 lifespan。老项目迁移过来也不难，就是把 startup 函数体放到 yield 前，shutdown 函数体放到 yield 后。

### 4.5 启动时建数据库连接池

### Demo 3：数据库连接池生命周期

\`\`\`python
# 文件：app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # —— 启动：创建连接池 ——
    # create_engine 内部就维护了连接池，这里只创建一次
    engine = create_engine(
        settings.database_url,
        pool_size=settings.db_pool_size,       # 连接池大小
        max_overflow=settings.db_max_overflow, # 允许溢出的连接数
        pool_pre_ping=True,                    # 每次取连接前 ping 一下，避免拿到死连接
    )
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    
    # 存到 app.state，全局可访问
    app.state.engine = engine
    app.state.SessionLocal = SessionLocal
    print(f">>> 数据库连接池已创建: {settings.database_url}")
    
    yield
    
    # —— 关闭：释放连接池 ——
    engine.dispose()  # 关闭所有连接
    print(">>> 数据库连接池已释放")

app = FastAPI(lifespan=lifespan)

def get_db():
    # 从 app.state 拿会话工厂
    from fastapi import Request
    # 真实项目用 Depends(get_db) 的方式，这里简化
    pass
\`\`\`

### 4.6 启动时加载 Redis / 外部服务

### Demo 4：Redis 连接生命周期

\`\`\`python
# 文件：app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
import redis.asyncio as aioredis  # 异步 Redis 客户端
from app.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # —— 启动：连 Redis ——
    # 用 async with 确保连不上时直接报错，不会带病运行
    redis = aioredis.from_url(
        settings.redis_url,
        encoding="utf-8",
        decode_responses=True,
        max_connections=20,  # 连接池大小
    )
    # 测试连接是否真的通
    try:
        await redis.ping()
        print(">>> Redis 连接成功")
    except Exception as e:
        # 连不上直接报错退出，别让应用带病启动
        raise RuntimeError(f"Redis 连接失败: {e}")
    
    app.state.redis = redis
    
    yield
    
    # —— 关闭：关 Redis 连接池 ——
    await redis.close()
    print(">>> Redis 连接已关闭")

app = FastAPI(lifespan=lifespan)

@app.get("/cache/{key}")
async def get_cache(key: str):
    # 从 app.state.redis 读
    val = await app.state.redis.get(key)
    return {"key": key, "value": val}
\`\`\`

### 4.7 启动时加载 ML 模型 / 预热缓存

有些重资源（机器学习模型、大字典）启动时加载到内存，避免每次请求都加载。

### Demo 5：启动时加载模型并预热

\`\`\`python
# 文件：app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
import time

class FakeModel:
    """假装是一个机器学习模型，加载很慢"""
    def __init__(self):
        print("加载模型中（耗时 3 秒）...")
        time.sleep(3)  # 模拟加载耗时
        self.ready = True
    
    def predict(self, text: str) -> str:
        return f"预测结果: {text[:10]}..."

@asynccontextmanager
async def lifespan(app: FastAPI):
    # —— 启动：加载模型 ——
    # 放在 startup 阶段，只加载一次，之后所有请求复用
    model = FakeModel()
    app.state.model = model
    
    # 预热：跑一次假预测，让模型"热起来"（JIT、缓存等）
    model.predict("预热输入")
    print(">>> 模型已加载并预热")
    
    yield
    
    # —— 关闭：释放模型资源 ——
    # 有些模型（GPU、CUDA）需要显式释放
    app.state.model = None
    print(">>> 模型资源已释放")

app = FastAPI(lifespan=lifespan)

@app.post("/predict")
def predict(payload: dict):
    text = payload.get("text", "")
    # 直接用已加载的模型，毫秒级响应
    result = app.state.model.predict(text)
    return {"result": result}
\`\`\`

> 如果不加 lifespan，把模型加载写在路由里，每次请求都加载一次 3 秒，用户体验灾难。lifespan 让"一次加载，万次复用"成为可能。

### 4.8 多个 lifespan 的组合

真实项目要同时管数据库、Redis、模型、消息队列。全堆一个 lifespan 函数里会很长。可以拆成多个，再组合。

### Demo 6：组合多个 lifespan

\`\`\`python
# 文件：app/lifespan.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
import redis.asyncio as aioredis
from sqlalchemy import create_engine
from app.config import settings

# —— 数据库 lifespan ——
@asynccontextmanager
async def db_lifespan(app: FastAPI):
    # 启动
    engine = create_engine(settings.database_url, pool_pre_ping=True)
    app.state.engine = engine
    print(">>> DB 就绪")
    try:
        yield
    finally:
        # 关闭：finally 确保即使出异常也能清理
        engine.dispose()
        print(">>> DB 已释放")

# —— Redis lifespan ——
@asynccontextmanager
async def redis_lifespan(app: FastAPI):
    redis = aioredis.from_url(settings.redis_url, decode_responses=True)
    await redis.ping()
    app.state.redis = redis
    print(">>> Redis 就绪")
    try:
        yield
    finally:
        await redis.close()
        print(">>> Redis 已关闭")

# —— 组合器：把多个 lifespan 串起来 ——
@asynccontextmanager
async def app_lifespan(app: FastAPI):
    """主 lifespan，组合所有子 lifespan"""
    # AsyncExitStack 是 Python 标准库的异步上下文管理器栈
    # 它能管理多个异步上下文，退出时按"后进先出"顺序调用各自的清理代码
    from contextlib import AsyncExitStack
    async with AsyncExitStack() as stack:
        # 进入顺序：db → redis
        # enter_async_context 把子 lifespan 压入栈并执行其 yield 前的代码
        await stack.enter_async_context(db_lifespan(app))
        await stack.enter_async_context(redis_lifespan(app))
        print(">>> 所有资源就绪，开始服务")
        yield
        # 退出时 AsyncExitStack 自动按相反顺序调各 lifespan 的清理代码
        # 退出顺序：redis → db（后进先出，符合资源依赖关系）
\`\`\`

\`\`\`python
# 文件：app/main.py
from fastapi import FastAPI
from app.lifespan import app_lifespan

app = FastAPI(lifespan=app_lifespan)

@app.get("/")
async def root():
    # DB 和 Redis 都能用了
    await app.state.redis.set("k", "v")
    return {"redis": await app.state.redis.get("k")}
\`\`\`

> AsyncExitStack 的妙处：资源按进入顺序初始化，按相反顺序清理。如果 Redis 依赖数据库，就先初始化 DB 再初始化 Redis，关闭时先关 Redis 再关 DB，不会出现"DB 先关了 Redis 还在用"的问题。

### 4.9 启动失败的处理

启动时连不上数据库怎么办？两种策略：

1. **快速失败**：直接抛异常让应用退出（推荐，符合 fail-fast）；
2. **降级启动**：记日志，部分功能不可用。

### Demo 7：启动失败处理

\`\`\`python
# 文件：app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
import redis.asyncio as aioredis
import logging

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # —— 策略一：快速失败（推荐生产用）——
    # 连不上就直接抛，应用起不来，运维立刻收到告警
    try:
        redis = aioredis.from_url("redis://localhost:6379/0")
        await redis.ping()
        app.state.redis = redis
        app.state.redis_available = True
        logger.info("Redis 连接成功")
    except Exception as e:
        # 不吞异常，直接 fail
        raise RuntimeError(f"启动失败：Redis 不可用: {e}")
    
    yield
    
    if app.state.redis_available:
        await app.state.redis.close()
        logger.info("Redis 已关闭")

# —— 策略二：降级启动（缓存场景可选）——
@asynccontextmanager
async def lifespan_degraded(app: FastAPI):
    """Redis 挂了也能跑，只是缓存功能不可用"""
    app.state.redis = None
    app.state.redis_available = False
    try:
        redis = aioredis.from_url("redis://localhost:6379/0")
        await redis.ping()
        app.state.redis = redis
        app.state.redis_available = True
        logger.info("Redis 连接成功，缓存可用")
    except Exception as e:
        # 记 WARNING，应用照常启动，但缓存降级
        logger.warning(f"Redis 不可用，缓存降级: {e}")
    
    yield
    
    if app.state.redis_available and app.state.redis:
        await app.state.redis.close()

app = FastAPI(lifespan=lifespan)

@app.get("/cache/{key}")
async def get_cache(key: str):
    if not app.state.redis_available:
        # 缓存不可用时直接返回降级响应
        return {"msg": "缓存不可用", "fallback": True}
    val = await app.state.redis.get(key)
    return {"key": key, "value": val}
\`\`\`

> 怎么选？**核心依赖（数据库）必须 fail-fast**——连不上就别启动。**非核心依赖（缓存、搜索引擎）可以降级**——挂了功能受限但不全崩。

### 4.10 实战：完整的生命周期管理

把数据库、Redis、外部服务客户端全合起来。

### Demo 8：完整生命周期（DB + Redis + HTTP 客户端）

\`\`\`python
# 文件：app/lifespan.py
"""完整生命周期管理：数据库 + Redis + 外部 HTTP 客户端"""
import logging
from contextlib import asynccontextmanager, AsyncExitStack
from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import redis.asyncio as aioredis
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

# —— 数据库 ——
@asynccontextmanager
async def db_lifespan(app: FastAPI):
    """数据库连接池生命周期"""
    engine = create_engine(
        settings.database_url,
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        pool_pre_ping=True,
    )
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    app.state.engine = engine
    app.state.SessionLocal = SessionLocal
    logger.info("数据库连接池就绪")
    try:
        yield
    finally:
        engine.dispose()
        logger.info("数据库连接池已释放")

# —— Redis ——
@asynccontextmanager
async def redis_lifespan(app: FastAPI):
    """Redis 连接生命周期"""
    redis = aioredis.from_url(settings.redis_url, decode_responses=True, max_connections=20)
    try:
        await redis.ping()
        app.state.redis = redis
        logger.info("Redis 连接就绪")
    except Exception as e:
        await redis.close()
        raise RuntimeError(f"Redis 连接失败: {e}")
    try:
        yield
    finally:
        await redis.close()
        logger.info("Redis 连接已关闭")

# —— 外部 HTTP 客户端（调用第三方 API 用）——
@asynccontextmanager
async def http_client_lifespan(app: FastAPI):
    """httpx 异步客户端生命周期
    复用连接池，比每次请求 new 一个 client 高效得多
    """
    # limits 控制连接池：最多 100 个连接，每个 host 最多 20 个
    client = httpx.AsyncClient(
        timeout=httpx.Timeout(10.0, connect=5.0),
        limits=httpx.Limits(max_connections=100, max_keepalive_connections=20),
    )
    app.state.http_client = client
    logger.info("HTTP 客户端就绪")
    try:
        yield
    finally:
        await client.aclose()
        logger.info("HTTP 客户端已关闭")

# —— 主 lifespan：组合所有子 lifespan ——
@asynccontextmanager
async def app_lifespan(app: FastAPI):
    """应用主生命周期，按依赖顺序初始化资源"""
    logger.info("=" * 50)
    logger.info("应用启动中...")
    
    async with AsyncExitStack() as stack:
        # 顺序：DB → Redis → HTTP 客户端
        # 关闭顺序相反：HTTP 客户端 → Redis → DB
        await stack.enter_async_context(db_lifespan(app))
        await stack.enter_async_context(redis_lifespan(app))
        await stack.enter_async_context(http_client_lifespan(app))
        
        logger.info("所有资源就绪，开始接收请求")
        logger.info("=" * 50)
        yield
    
    logger.info("应用已关闭")
\`\`\`

\`\`\`python
# 文件：app/main.py
from fastapi import FastAPI, Request
from app.lifespan import app_lifespan
from app.database import get_db
from app.config import settings
from sqlalchemy.orm import Session
from fastapi import Depends

app = FastAPI(title=settings.app_name, lifespan=app_lifespan)

@app.get("/health")
async def health():
    """健康检查：检查所有依赖是否就绪"""
    checks = {}
    # 检查 Redis
    try:
        await app.state.redis.ping()
        checks["redis"] = "ok"
    except Exception:
        checks["redis"] = "fail"
    # 检查 DB
    try:
        with app.state.engine.connect() as conn:
            conn.execute("SELECT 1")
        checks["db"] = "ok"
    except Exception:
        checks["db"] = "fail"
    # 检查 HTTP 客户端
    checks["http_client"] = "ok" if app.state.http_client else "fail"
    
    all_ok = all(v == "ok" for v in checks.values())
    return {"status": "healthy" if all_ok else "degraded", "checks": checks}

@app.get("/proxy")
async def proxy():
    """用启动时创建的 HTTP 客户端调外部 API"""
    # 复用 app.state.http_client，不用每次 new
    resp = await app.state.http_client.get("https://httpbin.org/get")
    return resp.json()
\`\`\`

### 4.11 lifespan vs on_event 对照

| 场景 | on_event | lifespan |
|------|----------|----------|
| 单资源初始化 | startup 函数 | yield 前 |
| 单资源清理 | shutdown 函数 | yield 后 |
| 多资源顺序控制 | 难，按注册顺序 | AsyncExitStack 精确控制 |
| 资源开闭配对 | 分散两处 | 写在一起 |
| 异常时清理 | shutdown 仍会调 | try/finally 保证 |
| 官方推荐 | ❌ 弃用 | ✅ 推荐 |

### 4.12 常见错误与避坑指南

**错误一：忘了 yield**

\`\`\`python
# ❌ 没 yield，应用直接"启动完就关闭"
@asynccontextmanager
async def lifespan(app):
    app.state.db = "连接"
    # 忘了 yield！应用不会进入服务状态

# ✅ 必须有 yield
@asynccontextmanager
async def lifespan(app):
    app.state.db = "连接"
    yield  # 这一行不能少
    app.state.db = None
\`\`\`

**错误二：yield 后的清理没加 try/finally**

\`\`\`python
# ❌ 如果 yield 前的代码抛异常，yield 后的清理不会执行
@asynccontextmanager
async def lifespan(app):
    init_a()
    init_b()  # 如果这里抛异常，cleanup_a 不会调
    yield
    cleanup_b()
    cleanup_a()

# ✅ 用 try/finally 保证清理
@asynccontextmanager
async def lifespan(app):
    init_a()
    try:
        init_b()
        yield
    finally:
        cleanup_b()
        cleanup_a()
\`\`\`

**错误三：同步阻塞操作卡住启动**

\`\`\`python
# ❌ 同步阻塞调用会卡住整个事件循环
@asynccontextmanager
async def lifespan(app):
    time.sleep(10)  # 阻塞 10 秒，期间应用完全无响应
    yield

# ✅ 同步重活放线程池
import asyncio
@asynccontextmanager
async def lifespan(app):
    await asyncio.to_thread(heavy_sync_init)  # 不阻塞事件循环
    yield
\`\`\`

**错误四：在 lifespan 里访问 request**：lifespan 是应用级的，没有 request 概念。别想在 lifespan 里读请求头。资源存 \`app.state\`，路由里通过 \`request.app.state\` 或 \`Depends\` 拿。

**错误五：连接池大小设错**：\`max_connections=1\` 会导致并发请求排队，吞吐量暴跌。生产环境连接池大小要根据并发量调，一般 10-50。

**错误六：关闭超时**：Docker/k8s 发 SIGTERM 后有超时（默认 10-30 秒），如果 lifespan 的关闭逻辑太久（比如等所有请求处理完），会被强杀。长任务要异步化或设合理超时。

**错误七：重复初始化**：用 \`--reload\` 开发时，lifespan 会执行多次（每次改代码重启）。确保初始化代码是幂等的——重复执行不出问题。

> 一句话总结：**lifespan 是应用级资源的"开关"**。yield 前开，yield 后关，try/finally 保平安，AsyncExitStack 管多资源。用好它，应用启动关闭都稳如老狗。
`,
  },
];
