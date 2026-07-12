// =============================================================
// FastAPI 代码详解 - 第 3 批：核心机制（4 章）
// -------------------------------------------------------------
// 本批章节：
//   fc-di-basic:    依赖注入入门
//   fc-di-advanced: 依赖注入进阶
//   fc-middleware:  中间件与 CORS
//   fc-database:    数据库操作（SQLAlchemy）
//
// 编写原则：demo 驱动，重点在代码注释里讲解，少废话
// =============================================================

export const chapters = [
  {
    id: "fc-di-basic",
    group: "核心机制",
    icon: "💉",
    title: "依赖注入入门",
    content: `# 依赖注入入门

## 什么是依赖注入

依赖注入（Dependency Injection）是 FastAPI 最强大的功能。简单说：**函数需要什么参数，FastAPI 自动帮你准备好**。

## Demo 1：最简单的依赖

\`\`\`python
from fastapi import FastAPI, Depends  # Depends 是依赖注入的核心

app = FastAPI()

# 普通函数，作为依赖
def get_hello():
    return "你好"

# Depends(get_hello) 表示：调用 get_hello()，把返回值赋给 hello 参数
@app.get("/")
def read_root(hello: str = Depends(get_hello)):
    # hello 的值 = get_hello() 的返回值
    return {"message": hello}

# 访问 / → {"message": "你好"}
\`\`\`

## Demo 2：依赖共享参数

\`\`\`python
# 依赖函数可以也需要参数（形成嵌套依赖）
def get_page(page: int = 1, size: int = 10):
    # 这个依赖函数自己有查询参数
    return {"page": page, "size": size}

@app.get("/items")
def list_items(pagination: dict = Depends(get_page)):
    # get_page 的返回值赋给 pagination
    return {
        "page": pagination["page"],
        "size": pagination["size"],
    }

# 访问 /items?page=2&size=20
# → {"page":2,"size":20}
# 注意：page 和 size 查询参数在依赖函数中定义，但路由函数中不可见
\`\`\`

## Demo 3：依赖获取数据库连接（最常用场景）

\`\`\`python
# 模拟数据库连接
class FakeDB:
    def __init__(self):
        self.connected = True
    def query(self, sql):
        return f"执行了: {sql}"

# 依赖函数：创建和关闭连接
def get_db():
    db = FakeDB()
    try:
        # yield 把 db 给路由函数使用
        yield db
    finally:
        # 路由函数执行完后，执行清理（关闭连接）
        db.connected = False
        print("数据库连接已关闭")

@app.get("/users")
def get_users(db: FakeDB = Depends(get_db)):
    # db 是 get_db() 中 yield 出来的值
    result = db.query("SELECT * FROM users")
    return {"result": result}

# 访问 /users → {"result": "执行了: SELECT * FROM users"}
# 请求结束后终端输出：数据库连接已关闭
\`\`\`

## Demo 4：yield 依赖的生命周期

\`\`\`python
# yield 依赖的执行顺序
def get_logger():
    print("1. 进入依赖（路由函数执行前）")
    yield "logger_instance"  # 把值给路由函数
    print("3. 退出依赖（路由函数执行后）")

@app.get("/demo")
def demo(logger: str = Depends(get_logger)):
    print("2. 执行路由函数")
    return {"logger": logger}

# 访问 /demo，终端输出：
# 1. 进入依赖（路由函数执行前）
# 2. 执行路由函数
# 3. 退出依赖（路由函数执行后）
\`\`\`

## Demo 5：多个依赖

\`\`\`python
def get_user():
    return {"name": "张三", "role": "admin"}

def get_db():
    return FakeDB()

@app.get("/admin")
def admin_panel(
    user: dict = Depends(get_user),  # 依赖 1
    db: FakeDB = Depends(get_db),    # 依赖 2
):
    # 多个依赖按顺序执行，互不干扰
    return {
        "user": user["name"],
        "role": user["role"],
        "db_connected": db.connected,
    }
\`\`\`

## Demo 6：依赖缓存（同一个请求中复用）

\`\`\`python
import random

def get_random():
    # 每次调用返回不同随机数
    return random.randint(1, 100)

@app.get("/test")
def test(
    a: int = Depends(get_random),  # 用 use_cache=True（默认）
    b: int = Depends(get_random),  # 默认 use_cache=True → 和 a 值相同
    c: int = Depends(get_random, use_cache=False),  # 禁用缓存 → 新的随机数
):
    # use_cache=True（默认）：同一个请求中，同一个依赖只执行一次，结果复用
    # use_cache=False：每次都重新执行依赖
    return {"a": a, "b": b, "c": c}

# 访问 /test → {"a":42,"b":42,"c":87}
# 注意：a 和 b 值相同（缓存），c 值不同（未缓存）
\`\`\`

## 小结

| 场景 | 用法 |
|------|------|
| 简单依赖 | Depends(func) |
| 带参数依赖 | 依赖函数自己声明参数 |
| 数据库连接 | yield 模式（自动清理） |
| 多个依赖 | 声明多个 Depends 参数 |
| 缓存控制 | use_cache=False 禁用缓存 |`
  },

  {
    id: "fc-di-advanced",
    group: "核心机制",
    icon: "🔗",
    title: "依赖注入进阶",
    content: `# 依赖注入进阶

## 依赖注入的更多用法

依赖注入不只是获取参数，还能做认证、权限检查、请求验证等。

## Demo 1：依赖做认证（最常见的用法）

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, Header

app = FastAPI()

# 认证依赖：检查 token 是否有效
def verify_token(authorization: str = Header()):
    # authorization 的值是 "Bearer xxx" 格式
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="缺少认证令牌")
    token = authorization.split(" ")[1]  # 提取 "Bearer " 后面的部分
    if token != "secret-token":
        raise HTTPException(status_code=401, detail="令牌无效")
    return token  # 返回 token 给路由函数使用

# 使用认证依赖
@app.get("/protected")
def protected_route(token: str = Depends(verify_token)):
    # 只有通过认证才能到这里
    return {"msg": "欢迎访问受保护资源", "token": token}

# 测试：
# curl http://localhost:8000/protected -H "Authorization: Bearer secret-token"
# → 200 成功
# curl http://localhost:8000/protected -H "Authorization: Bearer wrong"
# → 401 令牌无效
\`\`\`

## Demo 2：依赖获取当前用户

\`\`\`python
# 模拟数据库中的用户
fake_users = {
    "user-001": {"name": "张三", "role": "user"},
    "user-002": {"name": "李四", "role": "admin"},
}

# 依赖：从 token 获取当前用户
def get_current_user(token: str = Depends(verify_token)):
    # 依赖可以嵌套依赖（get_current_user 依赖 verify_token）
    # 实际项目中，token 中包含用户 ID，这里简化处理
    user_id = "user-001"  # 从 token 解析出用户 ID
    user = fake_users.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user

@app.get("/me")
def read_me(user: dict = Depends(get_current_user)):
    # 不需要手动验证 token，FastAPI 自动处理
    return {"user": user}

# 依赖链：read_me → get_current_user → verify_token
# 任何一环失败，请求都不会到达路由函数
\`\`\`

## Demo 3：权限检查依赖

\`\`\`python
# 检查是否是管理员
def require_admin(user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    return user

@app.get("/admin")
def admin_dashboard(admin: dict = Depends(require_admin)):
    # 只有管理员才能进来
    # 依赖链：require_admin → get_current_user → verify_token
    return {"msg": f"管理员 {admin['name']}，欢迎回来"}

# 普通用户访问 → 403 需要管理员权限
# 管理员访问 → 200 成功
\`\`\`

## Demo 4：类作为依赖

\`\`\`python
# 类也可以作为依赖，比函数更灵活

class Pagination:
    def __init__(self, page: int = 1, size: int = 10):
        self.page = page
        self.size = size
        self.offset = (page - 1) * size  # 计算偏移量

    def __call__(self):
        # __call__ 让实例可以像函数一样调用
        return self

@app.get("/items")
def list_items(pagination: Pagination = Depends(Pagination)):
    # Pagination 类被实例化，查询参数自动传入 __init__
    return {
        "page": pagination.page,
        "size": pagination.size,
        "offset": pagination.offset,
    }
\`\`\`

## Demo 5：全局依赖（所有路由都用的依赖）

\`\`\`python
from fastapi import FastAPI, Request
import time

app = FastAPI()

# 记录每个请求的处理时间
async def log_request(request: Request):
    start = time.time()
    # yield 之前是请求前执行
    yield
    # yield 之后是请求后执行
    duration = time.time() - start
    print(f"{request.method} {request.url.path} → {duration:.3f}s")

# 全局依赖：所有路由都自动使用
app = FastAPI(dependencies=[Depends(log_request)])

@app.get("/")
def root():
    return {"msg": "Hello"}

@app.get("/items")
def items():
    return {"items": []}

# 每个请求都会打印：GET / → 0.001s
# 每个请求都会打印：GET /items → 0.001s
\`\`\`

## Demo 6：子路由依赖

\`\`\`python
from fastapi import APIRouter

# 创建子路由
admin_router = APIRouter(
    prefix="/admin",        # 路径前缀
    dependencies=[Depends(require_admin)],  # 所有子路由都需要管理员权限
)

@admin_router.get("/dashboard")
def dashboard():
    return {"msg": "管理面板"}

@admin_router.get("/users")
def manage_users():
    return {"users": []}

# 注册子路由
app.include_router(admin_router)

# 访问 /admin/dashboard 和 /admin/users 都需要管理员权限
# 不需要在每个路由里重复写 Depends(require_admin)
\`\`\`

## 小结

| 用法 | 场景 |
|------|------|
| 认证依赖 | 验证 token |
| 嵌套依赖 | 依赖链（认证 → 用户 → 权限） |
| 类依赖 | 复杂逻辑，带状态 |
| 全局依赖 | 所有路由共享（日志、监控） |
| 子路由依赖 | 一组路由共享权限 |`
  },

  {
    id: "fc-middleware",
    group: "核心机制",
    icon: "🔌",
    title: "中间件与 CORS",
    content: `# 中间件与 CORS

## 中间件是什么

中间件在每个请求处理之前和之后执行，可以修改请求和响应。比依赖注入更底层。

## Demo 1：最简单的中间件

\`\`\`python
from fastapi import FastAPI, Request
import time

app = FastAPI()

# 中间件是 async 函数，接收 request 和 call_next
@app.middleware("http")
async def add_process_time(request: Request, call_next):
    # 请求处理前
    start = time.time()

    # call_next 调用下一个中间件或路由处理函数
    response = await call_next(request)

    # 请求处理后
    duration = time.time() - start
    # 给所有响应加一个自定义头
    response.headers["X-Process-Time"] = str(duration)

    return response

@app.get("/")
def root():
    return {"msg": "Hello"}

# 每个请求的响应头中都会有 X-Process-Time
# curl -v http://localhost:8000/ → 看到 X-Process-Time: 0.001
\`\`\`

## Demo 2：请求日志中间件

\`\`\`python
@app.middleware("http")
async def log_requests(request: Request, call_next):
    # 打印请求信息
    print(f"→ {request.method} {request.url.path}")

    response = await call_next(request)

    # 打印响应状态
    print(f"← {response.status_code}")

    return response

# 终端输出：
# → GET /users
# ← 200
\`\`\`

## Demo 3：CORS 中间件（跨域资源共享）

\`\`\`python
from fastapi.middleware.cors import CORSMiddleware

# CORS 是跨域问题的解决方案
# 浏览器默认禁止不同域名之间的请求，CORS 告诉浏览器哪些跨域请求是允许的

app = FastAPI()

# 添加 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 允许的前端域名
    allow_credentials=True,   # 允许携带 Cookie
    allow_methods=["*"],      # 允许所有 HTTP 方法（GET/POST/PUT/DELETE...）
    allow_headers=["*"],      # 允许所有请求头
)

# 常见配置：
# 开发环境：allow_origins=["*"]  允许所有来源
# 生产环境：allow_origins=["https://your-frontend.com"]  只允许你的前端
\`\`\`

## Demo 4：错误处理中间件

\`\`\`python
@app.middleware("http")
async def catch_exceptions(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        # 捕获所有未处理的异常，返回统一格式
        return JSONResponse(
            status_code=500,
            content={"error": "服务器内部错误", "detail": str(e)},
        )
\`\`\`

## Demo 5：中间件执行顺序

\`\`\`python
# 中间件按注册顺序执行（洋葱模型）
# 请求：M1 → M2 → M3 → 路由
# 响应：路由 → M3 → M2 → M1

@app.middleware("http")
async def middleware_1(request: Request, call_next):
    print("M1: 请求进入")
    response = await call_next(request)
    print("M1: 响应返回")
    return response

@app.middleware("http")
async def middleware_2(request: Request, call_next):
    print("  M2: 请求进入")
    response = await call_next(request)
    print("  M2: 响应返回")
    return response

# 访问任意路由，终端输出：
# M1: 请求进入
#   M2: 请求进入
#   M2: 响应返回
# M1: 响应返回
\`\`\`

## Demo 6：中间件 vs 依赖注入

\`\`\`python
# 什么时候用中间件，什么时候用依赖注入？

# 中间件（Middleware）：
# - 对所有请求生效（全局）
# - 可以修改请求和响应
# - 更底层，执行在所有路由之前
# 场景：CORS、日志、性能监控、异常捕获

# 依赖注入（Depends）：
# - 可以按路由粒度控制
# - 获取参数、校验权限
# - 更高层，在路由函数之前执行
# 场景：认证、权限、数据库连接、参数校验

# 简单区分：
# 需要修改请求/响应 → 中间件
# 需要获取参数/校验 → 依赖注入
\`\`\`

## 小结

| 中间件 | 用途 |
|--------|------|
| 自定义中间件 | 日志、计时、异常处理 |
| CORSMiddleware | 解决跨域问题 |
| 洋葱模型 | 请求和响应按相反顺序经过中间件 |
| 中间件 vs 依赖 | 全局 vs 按路由，底层 vs 高层 |`
  },

  {
    id: "fc-database",
    group: "核心机制",
    icon: "🗄️",
    title: "数据库操作（SQLAlchemy）",
    content: `# 数据库操作（SQLAlchemy）

## 为什么用 SQLAlchemy

SQLAlchemy 是 Python 最流行的 ORM（对象关系映射），让你用 Python 对象操作数据库，不用写 SQL。

## Demo 1：连接数据库

\`\`\`python
# pip install sqlalchemy databases aiomysql  # 安装依赖
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# 数据库连接 URL（SQLite 为例，生产环境用 MySQL/PostgreSQL）
DATABASE_URL = "sqlite:///./test.db"  # 文件存储，简单

# 创建引擎
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # SQLite 需要这个参数
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base 是所有模型的基类
Base = declarative_base()
\`\`\`

## Demo 2：定义模型

\`\`\`python
from sqlalchemy import Column, Integer, String, Float, Boolean

# 定义 User 模型（对应数据库中的 users 表）
class User(Base):
    __tablename__ = "users"  # 表名

    id = Column(Integer, primary_key=True, index=True)  # 主键，自动递增
    name = Column(String(50), nullable=False)            # 不能为空
    email = Column(String(100), unique=True, index=True) # 唯一，建索引
    age = Column(Integer, default=0)                     # 默认值 0
    is_active = Column(Boolean, default=True)            # 默认 True

# 创建所有表（首次运行时执行）
Base.metadata.create_all(bind=engine)
\`\`\`

## Demo 3：依赖注入数据库会话

\`\`\`python
from fastapi import FastAPI, Depends

app = FastAPI()

# 依赖函数：每次请求创建新的数据库会话
def get_db():
    db = SessionLocal()  # 创建会话
    try:
        yield db  # 给路由函数使用
    finally:
        db.close()  # 请求结束后关闭会话

# 使用方式：在路由参数中注入 db
@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    # db.query(User) 相当于 SELECT * FROM users
    users = db.query(User).all()
    return users  # 返回所有用户
\`\`\`

## Demo 4：CRUD 完整操作

\`\`\`python
from pydantic import BaseModel

# 请求体模型
class UserCreate(BaseModel):
    name: str
    email: str
    age: int = 0

# CREATE —— 创建用户
@app.post("/users", status_code=201)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # 创建 ORM 对象
    db_user = User(name=user.name, email=user.email, age=user.age)
    db.add(db_user)      # 添加到会话
    db.commit()          # 提交到数据库
    db.refresh(db_user)  # 刷新获取数据库生成的 id
    return db_user

# READ —— 查询单个用户
@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    # db.query(User).filter(...) 相当于 SELECT * FROM users WHERE id = ?
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user

# READ —— 查询列表（带筛选和分页）
@app.get("/users")
def list_users(
    skip: int = 0,    # 跳过前 N 条
    limit: int = 10,  # 最多返回 N 条
    db: Session = Depends(get_db),
):
    # offset 和 limit 实现分页
    users = db.query(User).offset(skip).limit(limit).all()
    return users

# UPDATE —— 更新用户
@app.put("/users/{user_id}")
def update_user(user_id: int, user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="用户不存在")
    # 更新字段
    db_user.name = user.name
    db_user.email = user.email
    db_user.age = user.age
    db.commit()
    db.refresh(db_user)
    return db_user

# DELETE —— 删除用户
@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="用户不存在")
    db.delete(db_user)
    db.commit()
    # 删除成功，返回 204 No Content
    return {"msg": "删除成功"}
\`\`\`

## Demo 5：响应模型（过滤敏感字段）

\`\`\`python
from pydantic import BaseModel

# 响应模型：控制返回给用户的字段
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    age: int
    is_active: bool

    class Config:
        orm_mode = True  # 允许从 ORM 对象创建 Pydantic 模型

@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user  # FastAPI 自动转成 UserResponse 格式

# 注意：User 模型可能有 password 字段，但 UserResponse 没有
# → 密码不会返回给客户端
\`\`\`

## Demo 6：关联查询

\`\`\`python
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey

# 定义两个关联模型
class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100))
    content = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))  # 外键

    # relationship 建立关联关系
    author = relationship("User", back_populates="posts")

# 在 User 模型中添加反向关联
User.posts = relationship("Post", back_populates="author")

# 查询用户及其所有文章
@app.get("/users/{user_id}/posts")
def get_user_posts(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user.posts  # 通过 relationship 直接获取关联数据
\`\`\`

## 小结

| 操作 | SQLAlchemy 方法 |
|------|----------------|
| 查询所有 | db.query(Model).all() |
| 条件查询 | db.query(Model).filter(...).first() |
| 分页 | .offset(skip).limit(limit) |
| 创建 | db.add() + db.commit() |
| 更新 | 修改属性 + db.commit() |
| 删除 | db.delete() + db.commit() |
| 关联 | relationship + ForeignKey |`
  },
];