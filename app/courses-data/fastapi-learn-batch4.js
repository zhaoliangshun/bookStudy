// =============================================================
// FastAPI Demo 详解 - 第 4 批章节（实战进阶 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fl-database: 数据库集成
//   fl-auth:     认证安全
//   fl-cors:     CORS 跨域
//   fl-deploy:   测试与部署
// =============================================================

export const chapters = [
  {
    id: "fl-database",
    group: "实战进阶",
    icon: "🗄️",
    title: "数据库集成",
    content: `# 数据库集成

## 用 SQLAlchemy 连接数据库

\`\`\`python
# SQLAlchemy 是 Python 最流行的 ORM（对象关系映射）
# 用 Python 对象操作数据库，不用写 SQL
#
# 安装：
# pip install sqlalchemy
#
# 本例用 SQLite（无需安装数据库服务，文件即数据库）
\`\`\`

## Demo 1：数据库连接配置

\`\`\`python
# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite 连接字符串
# sqlite:///./app.db 表示当前目录下的 app.db 文件
# check_same_thread=False：允许多线程访问（FastAPI 需要）
SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"

# create_engine 创建数据库引擎
# connect_args 仅 SQLite 需要
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# SessionLocal：数据库会话工厂
# 每个请求创建一个 session，用完关闭
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base：所有模型的基类
Base = declarative_base()
\`\`\`

## Demo 2：定义模型（表结构）

\`\`\`python
# models.py
from sqlalchemy import Column, Integer, String, Float, Boolean
from database import Base

# 每个类对应一张表，继承 Base
class Item(Base):
    __tablename__ = "items"  # 表名

    # Column(类型, 约束) 定义字段
    id = Column(Integer, primary_key=True, index=True)  # 主键
    name = Column(String(50), index=True)               # 字符串，建索引
    price = Column(Float)                               # 浮点数
    is_offer = Column(Boolean, default=False)           # 布尔，有默认值

# 运行 Base.metadata.create_all(engine) 会自动建表
\`\`\`

## Demo 3：依赖注入获取 session（推荐模式）

\`\`\`python
# main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
from models import Item
from pydantic import BaseModel

# 建表（开发时用，生产用 Alembic 迁移）
Base.metadata.create_all(bind=engine)

app = FastAPI()

# 用 yield 依赖管理 session（见依赖注入章）
def get_db():
    db = SessionLocal()
    try:
        yield db  # 把 session 给路由用
    finally:
        db.close()  # 路由结束后关闭

# Pydantic 模型（API 数据格式）
class ItemCreate(BaseModel):
    name: str
    price: float
    is_offer: bool = False
\`\`\`

## Demo 4：CRUD 增删改查

\`\`\`python
# 接 Demo 3 的代码

# CREATE 创建
@app.post("/items", response_model=dict)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    # 1. 用 SQLAlchemy 模型创建对象
    db_item = Item(**item.dict())
    # 2. 加到 session
    db.add(db_item)
    # 3. 提交事务（真正写库）
    db.commit()
    # 4. 刷新获取自增 id
    db.refresh(db_item)
    return {"id": db_item.id, "name": db_item.name}

# READ 查询
@app.get("/items/{item_id}")
def read_item(item_id: int, db: Session = Depends(get_db)):
    # db.query(模型).filter(条件).first() 查询
    item = db.query(Item).filter(Item.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="不存在")
    return {"id": item.id, "name": item.name, "price": item.price}

# READ 列表
@app.get("/items")
def list_items(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    # .offset().limit() 分页
    items = db.query(Item).offset(skip).limit(limit).all()
    return items

# UPDATE 更新
@app.put("/items/{item_id}")
def update_item(item_id: int, item: ItemCreate, db: Session = Depends(get_db)):
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="不存在")
    # 更新字段
    for key, value in item.dict().items():
        setattr(db_item, key, value)
    db.commit()  # 提交修改
    return {"msg": "已更新"}

# DELETE 删除
@app.delete("/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="不存在")
    db.delete(db_item)
    db.commit()
    return {"msg": "已删除"}
\`\`\`

## Demo 5：异步数据库（SQLAlchemy 2.0 async）

\`\`\`python
# 异步版本，配合 async def 路由
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# aiosqlite 是 SQLite 的异步驱动
# pip install aiosqlite
ASYNC_URL = "sqlite+aiosqlite:///./app.db"

# async engine
async_engine = create_async_engine(ASYNC_URL)
AsyncSessionLocal = sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False,
)

# 异步依赖
async def get_db():
    async with AsyncSessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()

# 路由用 async def
@app.get("/items/{item_id}")
async def read_item(item_id: int, db: AsyncSession = Depends(get_db)):
    # await db.execute(...) 执行查询
    result = await db.execute(
        select(Item).where(Item.id == item_id)
    )
    item = result.scalar_one_or_none()
    return item
\`\`\`

## 小结

| 操作 | SQLAlchemy 写法 |
|------|-----------------|
| 查询 | \`db.query(M).filter(...).first()\` |
| 列表 | \`db.query(M).all()\` |
| 创建 | \`db.add(obj); db.commit()\` |
| 更新 | \`setattr(obj, k, v); db.commit()\` |
| 删除 | \`db.delete(obj); db.commit()\` |

**核心模式**：用 \`yield\` 依赖管理 session，每个请求独立 session。`
  },

  {
    id: "fl-auth",
    group: "实战进阶",
    icon: "🔐",
    title: "认证安全",
    content: `# 认证安全

## 认证 vs 授权

\`\`\`python
# 认证（Authentication）：你是谁？验证身份（登录）
# 授权（Authorization）：你能做什么？权限控制
#
# 常见认证方式：
# 1. Session + Cookie：传统，服务端存 session
# 2. JWT：无状态，token 里存信息，前后端分离常用
# 3. OAuth2：第三方登录（GitHub/Google 登录）
#
# 本节用 JWT，最主流的方式
\`\`\`

## Demo 1：JWT 基本原理

\`\`\`python
# JWT（JSON Web Token）= 头.载荷.签名
#
# 流程：
# 1. 用户登录，服务端验证账号密码
# 2. 服务端生成 JWT（含用户信息+签名），返回给客户端
# 3. 客户端把 JWT 存起来（localStorage/Cookie）
# 4. 后续请求带 Authorization: Bearer <token>
# 5. 服务端验证 JWT 签名，提取用户信息
#
# 安装：
# pip install python-jose[cryptography] passlib[bcrypt]
\`\`\`

## Demo 2：密码哈希

\`\`\`python
# security.py
from passlib.context import CryptContext

# CryptContext 管理密码哈希算法
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    # 哈希密码（存数据库时用哈希值，不存明文）
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    # 验证密码：明文 vs 哈希值
    return pwd_context.verify(plain, hashed)

# 使用：
# hash_password("123456") → "$2b$12$xxx..."（每次结果不同，因为含盐）
# verify_password("123456", "$2b$12$xxx...") → True
\`\`\`

## Demo 3：JWT 生成与验证

\`\`\`python
# security.py 续
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError

SECRET_KEY = "your-secret-key-keep-it-safe"  # 生产环境要从环境变量读
ALGORITHM = "HS256"

def create_access_token(data: dict, expires_minutes: int = 30):
    # data 是要编码进 token 的数据，比如 {"sub": "user1"}
    to_encode = data.copy()
    # 设置过期时间
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    # 生成 JWT 字符串
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict | None:
    try:
        # 解码并验证 token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None  # 过期或无效
\`\`\`

## Demo 4：OAuth2 登录流程

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

app = FastAPI()

# OAuth2PasswordBearer：声明本应用用 Bearer token 认证
# tokenUrl 指向获取 token 的接口，/docs 会显示登录按钮
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# 模拟用户库
fake_users = {
    "admin": {
        "username": "admin",
        "hashed_password": hash_password("123456"),  # 见 Demo 2
        "is_admin": True,
    }
}

class Token(BaseModel):
    access_token: str
    token_type: str

# 登录接口：OAuth2PasswordRequestForm 自动解析表单
@app.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends()):
    # form.username / form.password 是表单字段
    user = fake_users.get(form.username)
    if not user or not verify_password(form.password, user["hashed_password"]):
        raise HTTPException(
            status_code=401,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # 生成 token，sub 是 subject（用户标识）
    token = create_access_token({"sub": form.username})
    return {"access_token": token, "token_type": "bearer"}
\`\`\`

## Demo 5：保护路由（依赖注入验证 token）

\`\`\`python
# 接 Demo 4

# 依赖：从 token 解出当前用户
def get_current_user(token: str = Depends(oauth2_scheme)):
    # oauth2_scheme 自动从 Authorization 头取 token
    # 如果没有 token，FastAPI 自动返回 401
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="无效的 token")
    username = payload.get("sub")
    user = fake_users.get(username)
    if user is None:
        raise HTTPException(status_code=401, detail="用户不存在")
    return user

# 用依赖保护路由
@app.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    # 没带 token 或 token 无效 → 401
    # 有效 → 返回当前用户信息
    return {"username": current_user["username"]}

# 二级依赖：要求管理员
def get_admin_user(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="需要管理员权限")
    return current_user

@app.get("/admin")
def admin(user: dict = Depends(get_admin_user)):
    # 普通用户 → 403
    # 管理员 → 通过
    return {"msg": "欢迎管理员"}
\`\`\`

## Demo 6：完整登录示例（可运行）

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel

app = FastAPI()
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET = "dev-secret"
oauth2 = OAuth2PasswordBearer(tokenUrl="login")

users_db = {}

class User(BaseModel):
    username: str
    password: str

@app.post("/register")
def register(u: User):
    if u.username in users_db:
        raise HTTPException(400, "用户已存在")
    users_db[u.username] = {
        "username": u.username,
        "password": pwd_ctx.hash(u.password),
    }
    return {"msg": "注册成功"}

@app.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends()):
    user = users_db.get(form.username)
    if not user or not pwd_ctx.verify(form.password, user["password"]):
        raise HTTPException(401, "账号或密码错误")
    token = jwt.encode(
        {"sub": form.username, "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
        SECRET,
    )
    return {"access_token": token, "token_type": "bearer"}

def current_user(token: str = Depends(oauth2)):
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        return users_db.get(payload["sub"])
    except JWTError:
        raise HTTPException(401, "token 无效")

@app.get("/me")
def me(user = Depends(current_user)):
    return {"username": user["username"]}
\`\`\`

## 小结

| 概念 | 工具 |
|------|------|
| 密码哈希 | \`passlib[bcrypt]\` |
| JWT | \`python-jose\` |
| 登录表单 | \`OAuth2PasswordRequestForm\` |
| token 提取 | \`OAuth2PasswordBearer\` |
| 保护路由 | \`Depends(get_current_user)\` |

**安全要点**：密码必须哈希存储，SECRET_KEY 不能硬编码到代码里。`
  },

  {
    id: "fl-cors",
    group: "实战进阶",
    icon: "🌍",
    title: "CORS 跨域",
    content: `# CORS 跨域

## 什么是跨域

\`\`\`python
# 同源策略：浏览器安全机制
# "源" = 协议 + 域名 + 端口
# 前端 http://localhost:3000 调用 API http://localhost:8000
# 端口不同 → 跨域 → 浏览器默认拦截
#
# CORS（跨域资源共享）：让服务端声明"允许哪些源访问"
# 服务端通过响应头告诉浏览器放行
#
# 关键响应头：
# Access-Control-Allow-Origin: 允许的源
# Access-Control-Allow-Methods: 允许的方法
# Access-Control-Allow-Headers: 允许的请求头
\`\`\`

## Demo 1：FastAPI 配置 CORS

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 配置 CORS（最常用方式）
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",     # React 开发服务器
        "http://localhost:5173",     # Vite 开发服务器
        "https://myapp.com",         # 生产域名
    ],
    allow_credentials=True,   # 允许携带 Cookie
    allow_methods=["*"],      # 允许所有 HTTP 方法
    allow_headers=["*"],      # 允许所有请求头
)

@app.get("/api/data")
def get_data():
    return {"data": "hello"}
\`\`\`

## Demo 2：开发环境允许所有源

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 开发时图方便，允许所有源
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # 允许所有源
    allow_credentials=False,      # 注意：* 和 True 不能同时用
    allow_methods=["*"],
    allow_headers=["*"],
)

# ⚠️ 生产环境不要用 ["*"]，要明确列出允许的域名
# 因为 ["*"] 等于关闭跨域保护
\`\`\`

## Demo 3：理解预检请求（OPTIONS）

\`\`\`python
# 浏览器对于"非简单请求"会先发 OPTIONS 请求"问一下"
# 这叫预检请求（Preflight）
#
# 简单请求（不触发预检）：
# - GET/POST/HEAD 方法
# - 只用基本头（Accept、Content-Type: text/plain 等）
#
# 非简单请求（触发预检）：
# - PUT/DELETE/PATCH
# - Content-Type: application/json
# - 自定义头（X-Token 等）
#
# FastAPI 的 CORSMiddleware 自动处理 OPTIONS 请求
# 你不用自己写 OPTIONS 路由

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

# 前端发 POST + JSON 时：
# 1. 浏览器先发 OPTIONS /api/data（预检）
# 2. 服务端返回允许的方法和头
# 3. 浏览器再发真正的 POST 请求
@app.post("/api/data")
def create_data():
    return {"msg": "ok"}
\`\`\`

## Demo 4：带 Cookie 的跨域（凭证）

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 如果前端要带 Cookie 跨域，必须：
# 1. allow_credentials=True
# 2. allow_origins 不能是 ["*"]，必须是具体域名
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 必须具体
    allow_credentials=True,                    # 允许带凭证
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/set-cookie")
def set_cookie(response):
    # 设置 Cookie
    response.set_cookie(key="token", value="abc", httponly=True)
    return {"msg": "cookie 已设置"}

@app.get("/get-cookie")
def get_cookie(token: str | None = None):
    # 前端跨域请求会带上 cookie（因为 allow_credentials=True）
    return {"token": token}
\`\`\`

## Demo 5：前端如何调用（对照）

\`\`\`javascript
// 前端 fetch 调用示例（对照理解）

// 1. 普通请求
fetch("http://localhost:8000/api/data")
  .then(r => r.json())

// 2. 带 JSON 体的 POST（触发预检）
fetch("http://localhost:8000/api/data", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "test" })
})

// 3. 带 Cookie 的请求
fetch("http://localhost:8000/api/data", {
  credentials: "include"  // 关键：带上 cookie
})

// 4. 带 token 的请求
fetch("http://localhost:8000/api/data", {
  headers: { "Authorization": "Bearer xxx" }
})
\`\`\`

## Demo 6：CORS 常见错误排查

\`\`\`python
# 错误 1：浏览器报 "CORS policy: No 'Access-Control-Allow-Origin'"
# 原因：服务端没配 CORS，或源不在 allow_origins 里
# 解决：检查 add_middleware 配置，加上前端域名

# 错误 2：带 cookie 时报错
# 原因：allow_origins=["*"] 且 allow_credentials=True
# 解决：allow_origins 用具体域名，不能用 *

# 错误 3：自定义头被拦截
# 原因：allow_headers 没包含该头
# 解决：allow_headers=["*"] 或明确列出

# 错误 4：PUT/DELETE 报 CORS 错
# 原因：allow_methods 没包含
# 解决：allow_methods=["*"]

# 调试技巧：浏览器 F12 → Network → 看请求和响应头
# 重点看响应头有没有 Access-Control-Allow-Origin
\`\`\`

## 小结

| 配置项 | 含义 |
|------|------|
| \`allow_origins\` | 允许的前端域名 |
| \`allow_methods\` | 允许的 HTTP 方法 |
| \`allow_headers\` | 允许的请求头 |
| \`allow_credentials\` | 是否允许带 Cookie |

**生产环境**：明确列出域名，不要用 \`*\`。`
  },

  {
    id: "fl-deploy",
    group: "实战进阶",
    icon: "🚀",
    title: "测试与部署",
    content: `# 测试与部署

## 用 TestClient 测试

\`\`\`python
# FastAPI 提供了 TestClient，不用真启动服务就能测试
# 基于 httpx，模拟 HTTP 请求

# 安装：pip install httpx pytest
\`\`\`

## Demo 1：基本测试

\`\`\`python
# main.py（被测代码）
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"msg": "hi"}

@app.get("/items/{item_id}")
def get_item(item_id: int):
    return {"item_id": item_id}

# test_main.py（测试代码）
from fastapi.testclient import TestClient
from main import app

# 用 app 创建测试客户端
client = TestClient(app)

def test_root():
    # 像发真请求一样测试
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"msg": "hi"}

def test_get_item():
    response = client.get("/items/42")
    assert response.status_code == 200
    assert response.json() == {"item_id": 42}

def test_get_item_invalid():
    # 测错误情况
    response = client.get("/items/abc")
    assert response.status_code == 422  # 类型校验失败

# 运行：pytest test_main.py
\`\`\`

## Demo 2：测试 POST 请求

\`\`\`python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_item():
    # POST 请求，json 参数发请求体
    response = client.post(
        "/items",
        json={"name": "苹果", "price": 5.5},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "苹果"

def test_create_item_invalid():
    # 测校验失败
    response = client.post("/items", json={"name": "苹果"})  # 缺 price
    assert response.status_code == 422

def test_with_query():
    # 带查询参数
    response = client.get("/items", params={"skip": 0, "limit": 5})
    assert response.status_code == 200

def test_with_headers():
    # 带请求头
    response = client.get("/items", headers={"X-Token": "abc"})
    assert response.status_code == 200
\`\`\`

## Demo 3：测试依赖覆盖

\`\`\`python
from fastapi.testclient import TestClient
from fastapi import FastAPI, Depends

app = FastAPI()

# 真实依赖：查数据库
def get_db():
    db = "真实数据库"
    yield db

@app.get("/items")
def list_items(db = Depends(get_db)):
    return {"db": db, "items": []}

# 测试时不想连真数据库，覆盖依赖
def override_get_db():
    yield "假数据库"  # 返回测试数据

client = TestClient(app)

def test_list_items():
    # 覆盖依赖：把 get_db 替换成 override_get_db
    app.dependency_overrides[get_db] = override_get_db

    response = client.get("/items")
    assert response.json()["db"] == "假数据库"

    # 测完清理覆盖
    app.dependency_overrides.clear()
\`\`\`

## Demo 4：测试认证接口

\`\`\`python
from fastapi.testclient import TestClient
from main import app  # 假设有上一章的认证代码

client = TestClient(app)

def test_login():
    # 测登录获取 token
    response = client.post(
        "/login",
        data={"username": "admin", "password": "123456"},  # 表单用 data
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return token

def test_protected_without_token():
    # 不带 token 访问受保护接口
    response = client.get("/me")
    assert response.status_code == 401

def test_protected_with_token():
    token = test_login()
    # 带 token 访问
    response = client.get(
        "/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert "username" in response.json()
\`\`\`

## Demo 5：部署准备（环境变量）

\`\`\`python
# config.py
import os
from pydantic_settings import BaseSettings  # pip install pydantic-settings

# 用 BaseSettings 管理配置，自动从环境变量读
class Settings(BaseSettings):
    app_name: str = "My API"
    database_url: str = "sqlite:///./app.db"
    secret_key: str = "dev-secret"
    debug: bool = True

    class Config:
        env_file = ".env"  # 从 .env 文件读

settings = Settings()

# main.py
from fastapi import FastAPI
from config import settings

app = FastAPI(title=settings.app_name, debug=settings.debug)

@app.get("/")
def root():
    return {"app": settings.app_name, "debug": settings.debug}

# .env 文件内容：
# APP_NAME=生产 API
# DATABASE_URL=postgresql://user:pass@db:5432/myapp
# SECRET_KEY=复杂随机字符串
# DEBUG=False
\`\`\`

## Demo 6：用 Gunicorn + Uvicorn 部署

\`\`\`bash
# 开发用：uvicorn main:app --reload
# 生产用：gunicorn + uvicorn worker（多进程）

# 安装
pip install gunicorn

# 启动命令（Linux/Mac）：
gunicorn main:app \\
    -w 4 \\              # 4 个 worker 进程
    -k uvicorn.workers.UvicornWorker \\
    -b 0.0.0.0:8000 \\   # 监听所有网卡的 8000
    --access-logfile -   # 输出访问日志

# 参数说明：
# -w 4：worker 数量，一般设为 CPU 核心数 * 2 + 1
# -k：worker 类型，UvicornWorker 支持 ASGI
# -b：绑定地址，0.0.0.0 表示对外可访问
\`\`\`

## Demo 7：用 Docker 部署

\`\`\`dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 先复制依赖文件，利用 Docker 缓存
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 再复制代码
COPY . .

# 启动命令
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
\`\`\`

\`\`\`bash
# 构建镜像
docker build -t myapi .

# 运行容器
docker run -d -p 8000:8000 --name api myapi

# -d 后台运行
# -p 8000:8000 端口映射（主机:容器）
# --name api 容器名
\`\`\`

## Demo 8：生产部署清单

\`\`\`python
# 部署前检查清单：

# 1. 关闭 debug
app = FastAPI(debug=False)

# 2. 用环境变量管理配置
# 不要把密钥写代码里

# 3. 配置 CORS（只允许你的前端域名）
# 不要用 allow_origins=["*"]

# 4. 关闭 /docs（可选，避免暴露接口）
app = FastAPI(docs_url=None, redoc_url=None)

# 5. 用 HTTPS（用 Nginx 反代加证书）
# 6. 设置日志
# 7. 数据库连接池配置
# 8. 静态文件用 CDN/Nginx，不走应用

# 典型生产架构：
# 用户 → Nginx(HTTPS) → Gunicorn(Uvicorn) → FastAPI → 数据库
\`\`\`

## 小结

| 阶段 | 工具 |
|------|------|
| 测试 | \`TestClient\` + pytest |
| 依赖覆盖 | \`app.dependency_overrides\` |
| 配置管理 | \`pydantic-settings\` |
| 生产服务 | gunicorn + uvicorn worker |
| 容器化 | Docker |

**测试原则**：覆盖正常路径 + 错误路径，依赖要能覆盖（mock）。

---

恭喜！你已经学完 FastAPI Demo 详解全部 16 章。现在你能用 FastAPI 构建完整的 API 应用了。下一步：动手做一个项目练手！`
  }
];
