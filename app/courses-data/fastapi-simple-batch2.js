// =============================================================
// FastAPI 实战教程（精简版）- 第 2 批章节（核心功能 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-pydantic: Pydantic 模型深入
//   fa-dependency: 依赖注入
//   fa-database: 数据库集成
//   fa-auth: 认证与安全
// ============================================================

export const chapters = [
  {
    id: "fa-pydantic",
    group: "核心功能",
    icon: "🔧",
    title: "Pydantic 模型深入",
    content: `# Pydantic 模型深入

## 什么是 Pydantic

Pydantic 是 Python 的数据验证库，FastAPI 用它来做请求体校验、响应序列化。核心思想是用类型注解来定义数据结构。

## Demo 1：基本模型

\`\`\`python
from fastapi import FastAPI
# 导入 BaseModel，Pydantic 的基类，用于定义数据模型
from pydantic import BaseModel

app = FastAPI()

# 定义 Pydantic 模型
class User(BaseModel):
    # 必填字段
    username: str
    email: str
    # 可选字段，有默认值
    age: int = 0
    is_active: bool = True

@app.post("/users")
def create_user(user: User):
    # user 已经过校验
    # 如果传错类型，会返回 422 错误
    # user 是 User 实例，用点号访问字段
    return {
        "username": user.username,
        "email": user.email,
        "age": user.age,
        "is_active": user.is_active
    }

# 测试：
# POST /users
# Body: {"username": "alice", "email": "alice@example.com"}
# 返回：{"username": "alice", "email": "alice@example.com", "age": 0, "is_active": true}
\`\`\`

## Demo 2：字段校验

\`\`\`python
from fastapi import FastAPI
# Field 用于给模型字段添加校验规则和文档元数据
from pydantic import BaseModel, Field

app = FastAPI()

class Product(BaseModel):
    # Field 用于添加校验规则
    name: str = Field(
        min_length=1,           # 最少 1 个字符
        max_length=100,         # 最多 100 个字符
        description="商品名称"   # 文档描述
    )
    price: float = Field(
        gt=0,                   # 必须大于 0
        le=99999,               # 小于等于 99999
        description="价格，0-99999"
    )
    stock: int = Field(
        default=0,              # 默认值
        ge=0,                   # 大于等于 0
        description="库存，非负"
    )
    # 正则校验
    sku: str = Field(
        pattern=r"^[A-Z]{2}-\\d{4}$",  # 格式：AB-1234
        description="SKU 编号"
    )

@app.post("/products")
def create_product(product: Product):
    # 如果校验失败，返回 422 错误
    return product

# Field 常用参数：
# - gt: 大于（>）
# - ge: 大于等于（>=）
# - lt: 小于（<）
# - le: 小于等于（<=）
# - min_length: 最小长度
# - max_length: 最大长度
# - pattern: 正则表达式
# - default: 默认值
# - description: 描述
\`\`\`

## Demo 3：嵌套模型

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# 定义嵌套模型
class Address(BaseModel):
    street: str
    city: str
    zipcode: str

class User(BaseModel):
    username: str
    # 嵌套模型
    address: Address

@app.post("/users")
def create_user(user: User):
    # Body: {
    #   "username": "alice",
    #   "address": {
    #     "street": "123 Main St",
    #     "city": "New York",
    #     "zipcode": "10001"
    #   }
    # }
    return {
        "username": user.username,
        "city": user.address.city,
        "zipcode": user.address.zipcode
    }
\`\`\`

## Demo 4：列表和字典字段

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Order(BaseModel):
    order_id: str
    # 列表字段
    items: list[str]
    # 字典字段
    metadata: dict[str, str]
    # 嵌套列表
    tags: list[dict[str, str]]

@app.post("/orders")
def create_order(order: Order):
    # Body: {
    #   "order_id": "ORD001",
    #   "items": ["item1", "item2"],
    #   "metadata": {"source": "web", "priority": "high"},
    #   "tags": [{"name": "urgent"}, {"name": "vip"}]
    # }
    return {
        "order_id": order.order_id,
        "item_count": len(order.items),
        "metadata_count": len(order.metadata),
        "tag_count": len(order.tags)
    }
\`\`\`

## Demo 5：模型继承

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# 基类
class UserBase(BaseModel):
    username: str
    email: str

# 创建用：继承基类，添加密码
class UserCreate(UserBase):
    password: str

# 响应用：继承基类，添加 ID
class UserResponse(UserBase):
    id: int
    is_active: bool

@app.post("/users", response_model=UserResponse)
def create_user(user: UserCreate):
    # 模拟创建用户
    # 返回 UserResponse 格式
    return {
        "id": 1,
        "username": user.username,
        "email": user.email,
        "is_active": True
    }

# 好处：
# - 复用字段定义
# - 不同场景用不同模型（创建、响应、更新）
# - 代码更清晰
\`\`\`

## Demo 6：模型序列化

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
    username: str
    password: str  # 敏感字段
    email: str

@app.post("/users")
def create_user(user: User):
    # 模型转字典
    user_dict = user.model_dump()
    # {'username': 'alice', 'password': 'secret', 'email': 'alice@example.com'}
    
    # 排除某些字段
    user_dict_safe = user.model_dump(exclude={'password'})
    # {'username': 'alice', 'email': 'alice@example.com'}
    
    # 只包含某些字段
    user_dict_partial = user.model_dump(include={'username', 'email'})
    # {'username': 'alice', 'email': 'alice@example.com'}
    
    return {
        "dict": user_dict_safe,
        "partial": user_dict_partial
    }
\`\`\`

## 本章小结

| 知识点 | 要点 |
|--------|------|
| 基本模型 | 用 BaseModel 定义数据结构 |
| 字段校验 | 用 Field 添加校验规则 |
| 嵌套模型 | 模型里嵌套其他模型 |
| 列表字典 | 支持 list、dict 字段 |
| 模型继承 | 复用字段定义 |
| 序列化 | model_dump() 转字典 |

下一章我们学习依赖注入，FastAPI 的核心特性之一。`
  },
  {
    id: "fa-dependency",
    group: "核心功能",
    icon: "💉",
    title: "依赖注入",
    content: `# 依赖注入

## 什么是依赖注入

依赖注入（Dependency Injection）是一种设计模式，用于管理组件之间的依赖关系。FastAPI 提供了强大的依赖注入系统，用于：
- 共享逻辑（如数据库连接、认证）
- 参数校验
- 权限控制

## Demo 1：基本依赖

\`\`\`python
from fastapi import FastAPI, Depends
# Depends 是依赖注入的核心，用于声明路由的依赖

app = FastAPI()

# 定义依赖函数
def common_parameters(q: str | None = None, skip: int = 0, limit: int = 100):
    # 这个函数会被多个路由复用
    # q/skip/limit 是查询参数，FastAPI 自动从 URL 提取
    return {"q": q, "skip": skip, "limit": limit}

# 在路由中使用 Depends 注入依赖
@app.get("/items")
def read_items(params: dict = Depends(common_parameters)):
    # params 会自动接收 common_parameters 的返回值
    # 查询参数会自动传递
    return params

@app.get("/users")
def read_users(params: dict = Depends(common_parameters)):
    # 同样的依赖，复用了 common_parameters
    return params

# 访问 /items?q=test&skip=10&limit=50
# 返回：{"q": "test", "skip": 10, "limit": 50}
\`\`\`

## Demo 2：依赖注入链

\`\`\`python
from fastapi import FastAPI, Depends

app = FastAPI()

# 依赖 1：查询参数
def query_params(q: str | None = None, page: int = 1):
    return {"q": q, "page": page}

# 依赖 2：可以依赖其他依赖
def pagination(params: dict = Depends(query_params)):
    # 依赖 query_params
    page = params["page"]
    page_size = 10
    return {
        "q": params["q"],
        "page": page,
        "page_size": page_size,
        "offset": (page - 1) * page_size
    }

@app.get("/items")
def read_items(pagination: dict = Depends(pagination)):
    # 依赖 pagination，pagination 又依赖 query_params
    return pagination

# 访问 /items?q=test&page=2
# 返回：{"q": "test", "page": 2, "page_size": 10, "offset": 10}
\`\`\`

## Demo 3：数据库会话依赖

\`\`\`python
from fastapi import FastAPI, Depends
# create_engine 创建数据库引擎（连接池）
from sqlalchemy import create_engine
# sessionmaker 是会话工厂，Session 是会话类型
from sqlalchemy.orm import sessionmaker, Session

app = FastAPI()

# 数据库配置
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
# 创建引擎，连接数据库
engine = create_engine(SQLALCHEMY_DATABASE_URL)
# 创建会话工厂
# autocommit=False：不自动提交，需手动 db.commit()
# autoflush=False：不自动刷新到数据库
# bind=engine：绑定到引擎
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 依赖：数据库会话
def get_db():
    # 创建数据库会话
    db = SessionLocal()
    try:
        # yield 返回会话给路由使用
        yield db
    finally:
        # 路由执行完毕后，关闭会话
        db.close()

# 在路由中使用数据库会话
@app.get("/users")
def read_users(db: Session = Depends(get_db)):
    # db 是数据库会话
    # 可以执行查询
    # users = db.query(User).all()
    return {"message": "数据库会话已注入"}

# 好处：
# - 自动管理会话生命周期
# - 避免在每个路由里重复创建/关闭会话
# - 方便测试（可以替换依赖）
\`\`\`

## Demo 4：认证依赖

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, status
# HTTPException 用于抛出 HTTP 错误，status 包含 HTTP 状态码常量
# HTTPBearer 是 Bearer token 认证方案，HTTPAuthorizationCredentials 是凭证类型
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

app = FastAPI()

# 定义安全方案
# HTTPBearer 自动从 Authorization: Bearer <token> 头中提取 token
security = HTTPBearer()

# 认证依赖
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # credentials.credentials 是 token 字符串
    token = credentials.credentials
    
    # 验证 token（这里简化，实际应该验证 JWT）
    if token != "secret-token":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    # 返回用户信息
    return {"username": "alice", "token": token}

# 需要认证的路由
@app.get("/users/me")
def read_current_user(user: dict = Depends(get_current_user)):
    # 如果 token 无效，会返回 401
    # 否则 user 包含用户信息
    return user

# 访问：
# GET /users/me
# Authorization: Bearer secret-token
# 返回：{"username": "alice", "token": "secret-token"}
\`\`\`

## Demo 5：权限控制依赖

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, status

app = FastAPI()

# 模拟用户数据库
users_db = {
    "alice": {"username": "alice", "role": "admin"},
    "bob": {"username": "bob", "role": "user"}
}

# 认证依赖
def get_current_user(token: str):
    # 简化：token 就是用户名
    if token not in users_db:
        raise HTTPException(status_code=401, detail="Invalid token")
    return users_db[token]

# 权限依赖
def require_admin(user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return user

# 需要管理员权限的路由
@app.delete("/users/{username}")
def delete_user(username: str, admin: dict = Depends(require_admin)):
    # 只有管理员才能删除用户
    return {"message": f"User {username} deleted by {admin['username']}"}

# 访问：
# DELETE /users/bob
# Authorization: Bearer alice  → 成功（alice 是 admin）
# Authorization: Bearer bob    → 403（bob 不是 admin）
\`\`\`

## Demo 6：依赖覆盖（测试用）

\`\`\`python
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient

app = FastAPI()

# 原始依赖
def get_db():
    # 实际数据库
    return {"db": "production"}

@app.get("/items")
def read_items(db: dict = Depends(get_db)):
    return {"db": db["db"]}

# 测试时覆盖依赖
def override_get_db():
    # 测试数据库
    return {"db": "test"}

# 覆盖依赖
app.dependency_overrides[get_db] = override_get_db

# 测试
client = TestClient(app)
response = client.get("/items")
# 返回：{"db": "test"}

# 清除覆盖
app.dependency_overrides.clear()
\`\`\`

## 本章小结

| 知识点 | 要点 |
|--------|------|
| 基本依赖 | Depends() 注入依赖函数 |
| 依赖链 | 依赖可以依赖其他依赖 |
| 数据库会话 | yield 管理生命周期 |
| 认证 | 依赖注入认证逻辑 |
| 权限控制 | 依赖链实现权限检查 |
| 依赖覆盖 | 测试时替换依赖 |

下一章我们学习数据库集成。`
  },
  {
    id: "fa-database",
    group: "核心功能",
    icon: "🗄️",
    title: "数据库集成",
    content: `# 数据库集成

## SQLAlchemy 基础

FastAPI 可以和任何数据库集成，最常用的是 SQLAlchemy（ORM）。

## Demo 1：数据库配置

\`\`\`python
from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

app = FastAPI()

# 数据库配置
# SQLite：sqlite:///./test.db
# PostgreSQL：postgresql://user:password@localhost/dbname
# MySQL：mysql+pymysql://user:password@localhost/dbname
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# 创建引擎
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite 需要
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 基类
class Base(DeclarativeBase):
    pass
\`\`\`

## Demo 2：定义模型

\`\`\`python
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
# Column 等是字段类型，ForeignKey 是外键
# relationship 用于定义模型间的关联关系
from sqlalchemy.orm import relationship

# 用户模型
class User(Base):
    __tablename__ = "users"  # 数据库表名
    
    # Column(类型, 约束) 定义字段
    id = Column(Integer, primary_key=True, index=True)       # 主键，自增，建索引
    username = Column(String, unique=True, index=True)       # 唯一，建索引
    email = Column(String, unique=True, index=True)          # 唯一，建索引
    hashed_password = Column(String)                         # 存哈希密码，不存明文
    is_active = Column(Boolean, default=True)                # 默认 True
    
    # 关系：一个用户可以有多个文章
    # back_populates 指定反向关联的字段名
    posts = relationship("Post", back_populates="author")

# 文章模型
class Post(Base):
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(String)
    # ForeignKey 定义外键，指向 users 表的 id 字段
    author_id = Column(Integer, ForeignKey("users.id"))
    
    # 关系：一篇文章属于一个用户
    author = relationship("User", back_populates="posts")

# 创建表
# 根据所有继承 Base 的模型，在数据库中创建对应的表
Base.metadata.create_all(bind=engine)
\`\`\`

## Demo 3：CRUD 操作

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

app = FastAPI()

# 依赖：获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic 模型
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool

# 创建用户
@app.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # 检查用户是否已存在
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 创建新用户
    # 注意：实际应该哈希密码
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=user.password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# 查询用户
@app.get("/users/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# 查询所有用户
@app.get("/users", response_model=list[UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

# 更新用户
@app.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_user.username = user.username
    db_user.email = user.email
    db_user.hashed_password = user.password
    db.commit()
    db.refresh(db_user)
    return db_user

# 删除用户
@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted"}
\`\`\`

## Demo 4：关系查询

\`\`\`python
# 查询用户及其文章
@app.get("/users/{user_id}/posts")
def read_user_posts(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 通过关系查询文章
    posts = db_user.posts
    return {
        "username": db_user.username,
        "posts": [{"id": p.id, "title": p.title} for p in posts]
    }
\`\`\`

## 本章小结

| 知识点 | 要点 |
|--------|------|
| 数据库配置 | create_engine + sessionmaker |
| 定义模型 | 继承 Base，定义 Column |
| CRUD | add/commit/query/delete |
| 关系 | relationship + ForeignKey |
| 会话管理 | yield 自动管理生命周期 |

下一章我们学习认证与安全。`
  },
  {
    id: "fa-auth",
    group: "核心功能",
    icon: "🔐",
    title: "认证与安全",
    content: `# 认证与安全

## 认证方式

FastAPI 支持多种认证方式：OAuth2、JWT、API Key 等。最常用的是 OAuth2 + JWT。

## Demo 1：密码哈希

\`\`\`python
# 导入 CryptContext，用于密码哈希和验证
from passlib.context import CryptContext

# 密码哈希上下文
# schemes 指定使用 bcrypt 算法（行业标准的密码哈希算法）
# deprecated="auto" 自动处理废弃的算法
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    # 哈希密码，返回哈希字符串
    # 相同密码每次哈希结果不同（因为含随机盐）
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # 验证密码：对比明文和哈希值
    # 返回 True/False
    return pwd_context.verify(plain_password, hashed_password)

# 使用
hashed = hash_password("secret")
# $2b$12$...

verify_password("secret", hashed)
# True

verify_password("wrong", hashed)
# False
\`\`\`

## Demo 2：JWT Token

\`\`\`python
# jose 是 JWT 库
# JWTError 是 JWT 相关异常，jwt 是编码/解码工具
from jose import JWTError, jwt
# datetime 用于时间操作，timedelta 表示时间间隔
from datetime import datetime, timedelta

# JWT 配置
SECRET_KEY = "your-secret-key"  # 实际应该用环境变量，不能硬编码
ALGORITHM = "HS256"  # 签名算法，HS256 是对称加密
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # token 有效期 30 分钟

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    # 创建 JWT token
    to_encode = data.copy()
    
    # 设置过期时间
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    
    # 编码
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    # 验证 token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return username
    except JWTError:
        return None

# 使用
token = create_access_token(data={"sub": "alice"})
# eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

username = verify_token(token)
# "alice"
\`\`\`

## Demo 3：OAuth2 登录

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, status
# OAuth2PasswordBearer：从 Authorization 头提取 Bearer token
# OAuth2PasswordRequestForm：标准 OAuth2 登录表单（username/password 字段）
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

app = FastAPI()

# OAuth2 安全方案
# tokenUrl 指向获取 token 的接口路径，/docs 会显示登录按钮
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 模拟用户数据库
fake_users_db = {
    "alice": {
        "username": "alice",
        "hashed_password": hash_password("secret"),
        "is_active": True
    }
}

# 用户模型
class User(BaseModel):
    username: str
    is_active: bool

# 认证依赖
def get_current_user(token: str = Depends(oauth2_scheme)):
    username = verify_token(token)
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = fake_users_db.get(username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user

# 登录接口
@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # 验证用户名和密码
    user = fake_users_db.get(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    # 创建 token
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

# 需要认证的路由
@app.get("/users/me")
def read_current_user(user: User = Depends(get_current_user)):
    return user

# 流程：
# 1. POST /token 登录，获取 token
# 2. 请求时带上 Authorization: Bearer <token>
# 3. get_current_user 验证 token
\`\`\`

## Demo 4：权限控制

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException

app = FastAPI()

# 权限依赖
def require_admin(user: User = Depends(get_current_user)):
    if user.username != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return user

@app.delete("/users/{user_id}")
def delete_user(user_id: int, admin: User = Depends(require_admin)):
    # 只有管理员才能删除用户
    return {"message": f"User {user_id} deleted"}
\`\`\`

## Demo 5：CORS 配置

\`\`\`python
from fastapi import FastAPI
# 导入 CORSMiddleware，用于解决跨域请求问题
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS 配置
# add_middleware 注册中间件，第一个参数是中间件类
app.add_middleware(
    CORSMiddleware,
    # 允许的前端地址
    allow_origins=["http://localhost:3000", "https://myapp.com"],
    # 允许的 HTTP 方法
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    # 允许的请求头，["*"] 表示所有
    allow_headers=["*"],
    # 允许携带 Cookie（跨域时前端需配合 credentials: "include"）
    allow_credentials=True,
)

@app.get("/api/data")
def get_data():
    return {"data": "hello"}
\`\`\`

## 本章小结

| 知识点 | 要点 |
|--------|------|
| 密码哈希 | bcrypt 哈希，verify 验证 |
| JWT | create_access_token 创建，verify_token 验证 |
| OAuth2 | OAuth2PasswordBearer + tokenUrl |
| 登录流程 | POST /token 获取 token |
| 权限控制 | 依赖注入实现权限检查 |
| CORS | CORSMiddleware 跨域配置 |

下一章我们学习响应处理。`
  }
];
