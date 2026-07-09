// =============================================================
// Python后端面试指南 - 第13批章节（FastAPI进阶实战 8章）
// =============================================================

export const chapters = [
  {
    id: "pyb-13-1",
    group: "FastAPI进阶实战",
    icon: "🔥",
    title: "FastAPI数据库集成",
    content: `

# FastAPI数据库集成

## 一、SQLAlchemy同步集成

### 1.1 环境准备与依赖安装

FastAPI与SQLAlchemy是最经典的组合。SQLAlchemy提供了强大的ORM功能，支持同步和异步两种模式。

\`\`\`bash
pip install fastapi uvicorn sqlalchemy python-multipart
\`\`\`

### 1.2 同步数据库配置

\`\`\`python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 数据库URL配置
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
# PostgreSQL: "postgresql://user:password@postgresserver/db"
# MySQL: "mysql+pymysql://user:password@mysqlserver/db"

# 创建引擎
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # 仅SQLite需要
)

# 会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 基类
Base = declarative_base()
\`\`\`

### 1.3 定义数据模型

\`\`\`python
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    posts = relationship("Post", back_populates="author")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    content = Column(Text, nullable=False)
    published = Column(Boolean, default=False)
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    author = relationship("User", back_populates="posts")
\`\`\`

### 1.4 Pydantic模式定义（Schemas）

\`\`\`python
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class PostBase(BaseModel):
    title: str
    content: str
    published: bool = False

class PostCreate(PostBase):
    pass

class Post(PostBase):
    id: int
    author_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    posts: List[Post] = []

    class Config:
        orm_mode = True
\`\`\`

---

## 二、数据库会话依赖

### 2.1 依赖注入获取数据库会话

\`\`\`python
from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.orm import Session

app = FastAPI(title="FastAPI数据库集成示例")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 创建所有表
Base.metadata.create_all(bind=engine)
\`\`\`

### 2.2 CRUD工具函数封装

\`\`\`python
from sqlalchemy.orm import Session
from typing import List, Optional
from . import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class CRUDUser:
    @staticmethod
    def get(db: Session, user_id: int) -> Optional[models.User]:
        return db.query(models.User).filter(models.User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[models.User]:
        return db.query(models.User).filter(models.User.email == email).first()

    @staticmethod
    def get_by_username(db: Session, username: str) -> Optional[models.User]:
        return db.query(models.User).filter(models.User.username == username).first()

    @staticmethod
    def get_multi(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
        return db.query(models.User).offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, obj_in: schemas.UserCreate) -> models.User:
        hashed_password = pwd_context.hash(obj_in.password)
        db_obj = models.User(
            email=obj_in.email,
            username=obj_in.username,
            hashed_password=hashed_password
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def update(db: Session, db_obj: models.User, obj_in: dict) -> models.User:
        for field, value in obj_in.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def remove(db: Session, user_id: int) -> models.User:
        obj = db.query(models.User).get(user_id)
        db.delete(obj)
        db.commit()
        return obj

crud_user = CRUDUser()
\`\`\`

### 2.3 API路由使用示例

\`\`\`python
@app.post("/users/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud_user.get_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="邮箱已注册"
        )
    return crud_user.create(db=db, obj_in=user)

@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud_user.get_multi(db, skip=skip, limit=limit)
    return users

@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud_user.get(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="用户不存在")
    return db_user
\`\`\`

---

## 三、SQLAlchemy异步集成

### 3.1 异步数据库配置

\`\`\`python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

ASYNC_DATABASE_URL = "postgresql+asyncpg://user:password@localhost/dbname"
# SQLite: "sqlite+aiosqlite:///./test.db"

async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600
)

AsyncSessionLocal = sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)
\`\`\`

### 3.2 异步数据库依赖

\`\`\`python
async def get_async_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
\`\`\`

### 3.3 异步CRUD操作

\`\`\`python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete

class AsyncCRUDUser:
    @staticmethod
    async def get(db: AsyncSession, user_id: int):
        result = await db.execute(
            select(models.User).where(models.User.id == user_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_multi(db: AsyncSession, skip: int = 0, limit: int = 100):
        result = await db.execute(
            select(models.User).offset(skip).limit(limit)
        )
        return result.scalars().all()

    @staticmethod
    async def create(db: AsyncSession, obj_in: schemas.UserCreate):
        db_obj = models.User(
            email=obj_in.email,
            username=obj_in.username,
            hashed_password=pwd_context.hash(obj_in.password)
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    @staticmethod
    async def update(db: AsyncSession, user_id: int, obj_in: dict):
        stmt = (
            update(models.User)
            .where(models.User.id == user_id)
            .values(**obj_in)
            .execution_options(synchronize_session="fetch")
        )
        await db.execute(stmt)
        await db.commit()
        return await AsyncCRUDUser.get(db, user_id)

async_crud_user = AsyncCRUDUser()
\`\`\`

### 3.4 异步API路由

\`\`\`python
@app.get("/async/users/{user_id}", response_model=schemas.User)
async def async_read_user(user_id: int, db: AsyncSession = Depends(get_async_db)):
    user = await async_crud_user.get(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user
\`\`\`

---

## 四、Alembic数据迁移

### 4.1 Alembic初始化与配置

\`\`\`bash
pip install alembic
alembic init alembic
\`\`\`

修改 \`alembic.ini\`：

\`\`\`ini
sqlalchemy.url = sqlite:///./test.db
\`\`\`

修改 \`alembic/env.py\`：

\`\`\`python
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.database import Base
from app import models

config = context.config
target_metadata = Base.metadata
\`\`\`

### 4.2 创建和执行迁移

\`\`\`bash
# 创建迁移脚本
alembic revision --autogenerate -m "create users and posts tables"

# 检查生成的迁移脚本
# alembic/versions/xxx_create_users_and_posts_tables.py

# 执行迁移
alembic upgrade head

# 回滚迁移
alembic downgrade -1

# 查看迁移历史
alembic history
\`\`\`

### 4.3 异步Alembic配置

\`\`\`python
# env.py 异步配置
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine

def run_migrations_online():
    connectable = create_async_engine(
        config.get_main_option("sqlalchemy.url"),
        poolclass=pool.NullPool
    )

    async def run_async_migrations():
        async with connectable.connect() as connection:
            await connection.run_sync(do_run_migrations)

    asyncio.run(run_async_migrations())
\`\`\`

---

## 五、事务管理

### 5.1 手动事务控制

\`\`\`python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()

@router.post("/transfer/")
def transfer_money(
    from_id: int,
    to_id: int,
    amount: float,
    db: Session = Depends(get_db)
):
    try:
        from_user = db.query(models.User).get(from_id)
        to_user = db.query(models.User).get(to_id)

        if not from_user or not to_user:
            raise HTTPException(status_code=404, detail="用户不存在")

        if from_user.balance < amount:
            raise HTTPException(status_code=400, detail="余额不足")

        from_user.balance -= amount
        to_user.balance += amount

        # 手动提交
        db.commit()
        return {"message": "转账成功"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
\`\`\`

### 5.2 嵌套事务与保存点

\`\`\`python
@router.post("/users/batch-create/")
def batch_create_users(users: List[schemas.UserCreate], db: Session = Depends(get_db)):
    created_users = []
    for user_data in users:
        try:
            # 创建保存点
            with db.begin_nested():
                hashed_pw = pwd_context.hash(user_data.password)
                db_user = models.User(
                    email=user_data.email,
                    username=user_data.username,
                    hashed_password=hashed_pw
                )
                db.add(db_user)
                created_users.append(db_user)
        except Exception as e:
            # 单个用户失败不影响其他用户
            continue
    db.commit()
    return created_users
\`\`\`

### 5.3 异步事务管理

\`\`\`python
@router.post("/async/transfer/")
async def async_transfer(
    from_id: int,
    to_id: int,
    amount: float,
    db: AsyncSession = Depends(get_async_db)
):
    async with db.begin():
        result_from = await db.execute(
            select(models.User).where(models.User.id == from_id).with_for_update()
        )
        result_to = await db.execute(
            select(models.User).where(models.User.id == to_id).with_for_update()
        )

        from_user = result_from.scalar_one_or_none()
        to_user = result_to.scalar_one_or_none()

        if not from_user or not to_user:
            raise HTTPException(status_code=404, detail="用户不存在")

        if from_user.balance < amount:
            raise HTTPException(status_code=400, detail="余额不足")

        from_user.balance -= amount
        to_user.balance += amount

    return {"message": "转账成功"}
\`\`\`

---

## 六、最佳实践与常见坑点

### 6.1 数据库配置最佳实践

| 配置项 | 推荐值 | 说明 |
|--------|--------|------|
| pool_size | 5-20 | 根据并发量调整 |
| max_overflow | 10-30 | 允许额外创建的连接数 |
| pool_recycle | 3600 | 连接回收时间，防止MySQL8小时断开问题 |
| pool_pre_ping | True | 连接前ping检测，避免使用失效连接 |
| echo | False | 生产环境关闭SQL日志 |

### 6.2 会话管理注意事项

1. **会话关闭**：始终使用try-finally确保会话关闭
2. **会话作用域**：每个请求一个会话，不要跨请求共享会话
3. **避免长会话**：会话持有时间不要太长，用完即关
4. **提交时机**：在合适的时机commit，不要在循环中频繁commit
5. **异常处理**：发生异常时必须rollback

### 6.3 常见坑点

**坑点1：SQLite线程安全问题**

\`\`\`python
# 错误：SQLite默认只能在创建它的线程中使用
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 正确：添加check_same_thread=False
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
\`\`\`

**坑点2：detached实例访问延迟加载属性**

\`\`\`python
# 错误：会话关闭后访问relationship会报错
@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).get(user_id)
    db.close()  # 关闭过早
    return user.posts  # 报错！

# 正确：在会话关闭前访问所有需要的数据
@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).get(user_id)
    _ = user.posts  # 预加载
    return user
\`\`\`

**坑点3：N+1查询问题**

\`\`\`python
# 错误：循环中访问关联对象导致N+1查询
users = db.query(models.User).all()
for user in users:
    print(user.posts)  # 每个用户都触发一次查询

# 正确：使用joinedload预加载
from sqlalchemy.orm import joinedload

users = db.query(models.User).options(joinedload(models.User.posts)).all()
for user in users:
    print(user.posts)  # 已预加载，无额外查询
\`\`\`

### 6.4 性能优化建议

1. **合理使用索引**：为常用查询条件添加索引
2. **分页查询**：大数据量查询必须分页
3. **只查询需要的字段**：避免select *
4. **批量操作**：使用bulk_insert_mappings、bulk_update_mappings
5. **读写分离**：主库写，从库读
6. **连接池监控**：监控连接池使用情况，避免连接泄漏
`
  },
  {
    id: "pyb-13-2",
    group: "FastAPI进阶实战",
    icon: "🔥",
    title: "JWT认证实现",
    content: `

# JWT认证实现

## 一、OAuth2与密码哈希基础

### 1.1 依赖安装

\`\`\`bash
pip install python-jose[cryptography] passlib[bcrypt] python-multipart
\`\`\`

### 1.2 密码哈希配置

\`\`\`python
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # 计算轮数，越高越安全但越慢
)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
\`\`\`

### 1.3 密码哈希对比表

| 算法 | 安全性 | 速度 | 是否推荐 |
|------|--------|------|---------|
| bcrypt | 高 | 中等 | ✅ 推荐 |
| Argon2 | 最高 | 较慢 | ✅ 更推荐 |
| PBKDF2 | 中 | 慢 | ⚠️ 可用 |
| MD5/SHA1 | 极低 | 快 | ❌ 禁止 |
| SHA256(不加盐) | 低 | 快 | ❌ 禁止 |

---

## 二、JWT令牌生成与验证

### 2.1 JWT配置参数

\`\`\`python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

SECRET_KEY = "your-secret-key-keep-it-safe-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# OAuth2方案
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
\`\`\`

### 2.2 Token数据模型

\`\`\`python
class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: Optional[str] = None

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None
    scopes: Optional[List[str]] = []
\`\`\`

### 2.3 创建Token函数

\`\`\`python
def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"
    })
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
\`\`\`

---

## 三、完整认证流程实现

### 3.1 用户验证函数

\`\`\`python
from sqlalchemy.orm import Session
from . import models

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(models.User).filter(
        (models.User.username == username) |
        (models.User.email == username)
    ).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user
\`\`\`

### 3.2 获取当前用户依赖

\`\`\`python
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        token_type: str = payload.get("type")
        if username is None or token_type != "access":
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(
        models.User.username == token_data.username
    ).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="用户已被禁用")
    return current_user
\`\`\`

### 3.3 登录接口实现

\`\`\`python
from fastapi.security import OAuth2PasswordRequestForm

@app.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id},
        expires_delta=access_token_expires
    )

    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(
        data={"sub": user.username, "user_id": user.id},
        expires_delta=refresh_token_expires
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
\`\`\`

---

## 四、Token刷新机制

### 4.1 Refresh Token接口

\`\`\`python
from pydantic import BaseModel

class RefreshTokenRequest(BaseModel):
    refresh_token: str

@app.post("/refresh-token", response_model=Token)
async def refresh_access_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的刷新令牌",
    )
    try:
        payload = jwt.decode(
            request.refresh_token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        username: str = payload.get("sub")
        token_type: str = payload.get("type")
        if username is None or token_type != "refresh":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(
        models.User.username == username
    ).first()
    if not user or not user.is_active:
        raise credentials_exception

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id},
        expires_delta=access_token_expires
    )

    new_refresh_token = create_refresh_token(
        data={"sub": user.username, "user_id": user.id},
        expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }
\`\`\`

### 4.2 Token黑名单（可选）

\`\`\`python
# 使用Redis存储已撤销的Token
import redis

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def revoke_token(token: str, expires_in: int):
    redis_client.setex(f"revoked_token:{token}", expires_in, "1")

def is_token_revoked(token: str) -> bool:
    return redis_client.exists(f"revoked_token:{token}")

# 在get_current_user中检查
async def get_current_user(token: str = Depends(oauth2_scheme), ...):
    if is_token_revoked(token):
        raise HTTPException(status_code=401, detail="Token已被撤销")
    # ...
\`\`\`

---

## 五、权限控制

### 5.1 角色权限装饰器

\`\`\`python
from functools import wraps
from fastapi import Depends

def requires_roles(*roles):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user: models.User = Depends(get_current_active_user), **kwargs):
            if current_user.role not in roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="权限不足"
                )
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

# 使用方式
@app.get("/admin/dashboard")
@requires_roles("admin", "superadmin")
async def admin_dashboard(current_user: models.User = Depends(get_current_active_user)):
    return {"message": "管理员面板"}
\`\`\`

### 5.2 基于Scope的权限控制

\`\`\`python
from fastapi.security import OAuth2PasswordBearer, SecurityScopes
from fastapi import Security

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="token",
    scopes={
        "me": "读取当前用户信息",
        "items:read": "读取项目",
        "items:write": "创建/修改项目",
        "admin": "管理员权限"
    }
)

async def verify_scopes(
    security_scopes: SecurityScopes,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="权限不足",
        headers={"WWW-Authenticate": authenticate_value},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        token_scopes = payload.get("scopes", [])
        username = payload.get("sub")
    except JWTError:
        raise credentials_exception

    for scope in security_scopes.scopes:
        if scope not in token_scopes:
            raise credentials_exception

    # 获取用户...
    return user

# 使用
@app.get("/items/", dependencies=[Security(verify_scopes, scopes=["items:read"])])
async def read_items():
    return [{"name": "Item 1"}]
\`\`\`

---

## 六、非对称加密RS256实现

### 6.1 生成RSA密钥对

\`\`\`bash
# 生成私钥
openssl genrsa -out private_key.pem 2048

# 生成公钥
openssl rsa -in private_key.pem -pubout -out public_key.pem
\`\`\`

### 6.2 RS256配置

\`\`\`python
with open("private_key.pem", "r") as f:
    PRIVATE_KEY = f.read()

with open("public_key.pem", "r") as f:
    PUBLIC_KEY = f.read()

ALGORITHM = "RS256"

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, PRIVATE_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, PUBLIC_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
\`\`\`

### 6.3 HS256 vs RS256对比

| 特性 | HS256 (对称) | RS256 (非对称) |
|------|-------------|----------------|
| 密钥 | 单个密钥 | 私钥签名/公钥验证 |
| 性能 | 快 | 较慢 |
| 安全性 | 密钥泄露风险 | 私钥不泄露则安全 |
| 适用场景 | 单体应用 | 微服务/分布式系统 |
| 密钥分发 | 需要安全共享 | 公钥可公开分发 |

---

## 七、最佳实践与安全建议

### 7.1 JWT安全最佳实践

1. **始终使用HTTPS**：防止Token在传输中被窃听
2. **设置合理过期时间**：Access Token短(15-30分钟)，Refresh Token长(7天)
3. **密钥安全存储**：使用环境变量或密钥管理服务，不要硬编码
4. **使用强算法**：HS256/RS256/ES256，禁止使用none算法
5. **验证所有声明**：exp(过期时间)、iss(签发者)、aud(受众)
6. **敏感操作重新验证**：修改密码、支付等操作要求重新输入密码

### 7.2 常见安全漏洞及防御

| 漏洞类型 | 描述 | 防御措施 |
|---------|------|---------|
| 无签名算法接受 | 接受alg: none的Token | 强制指定算法，不接受none |
| 算法混淆攻击 | 将RS256改为HS256，用公钥当密钥 | 严格验证算法类型 |
| Token泄露 | XSS、CSRF导致Token泄露 | 设置HttpOnly Cookie、CSP |
| 过期绕过 | 修改exp时间戳 | 服务器验证exp，不信任客户端 |
| 暴力破解 | 弱密钥被暴力破解 | 使用足够长度的密钥(256位+) |

### 7.3 生产环境配置清单

\`\`\`python
# 生产环境配置建议
class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY")  # 从环境变量读取
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    # 生成密钥命令: openssl rand -hex 32
\`\`\`

### 7.4 常见坑点

**坑点1：密钥硬编码在代码中**

\`\`\`python
# 错误
SECRET_KEY = "mysecretkey123"  # 提交到代码仓库！

# 正确：使用环境变量
import os
from dotenv import load_dotenv
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
\`\`\`

**坑点2：不验证Token类型**

\`\`\`python
# 错误：Refresh Token可以当作Access Token使用
payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

# 正确：验证Token类型
if payload.get("type") != "access":
    raise HTTPException(status_code=401, detail="无效的Token类型")
\`\`\`

**坑点3：Token存放在localStorage**

localStorage容易受XSS攻击，敏感Token建议使用HttpOnly Cookie存储：

\`\`\`python
from fastapi import Response

@app.post("/login")
async def login(response: Response, ...):
    access_token = create_access_token(...)
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=True,  # HTTPS only
        samesite="lax",
        max_age=1800
    )
    return {"message": "登录成功"}
\`\`\`
`
  },
  {
    id: "pyb-13-3",
    group: "FastAPI进阶实战",
    icon: "🔥",
    title: "FastAPI安全与OAuth2",
    content: `

# FastAPI安全与OAuth2

## 一、OAuth2授权码模式

### 1.1 OAuth2AuthorizationCodeBearer配置

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2AuthorizationCodeBearer

app = FastAPI()

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl="https://example.com/oauth/authorize",
    tokenUrl="https://example.com/oauth/token",
    refreshUrl="https://example.com/oauth/refresh",
    scopes={
        "openid": "OpenID Connect",
        "profile": "用户基本信息",
        "email": "用户邮箱",
        "api:read": "读取API",
        "api:write": "写入API"
    }
)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    # 验证token...
    return {"token": token}
\`\`\`

### 1.2 第三方OAuth登录（Google/GitHub）

\`\`\`python
from fastapi import FastAPI, Request
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from starlette.middleware.sessions import SessionMiddleware

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key="your-secret-key")

config = Config(".env")
oauth = OAuth(config)

oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

oauth.register(
    name='github',
    client_id=config('GITHUB_CLIENT_ID'),
    client_secret=config('GITHUB_CLIENT_SECRET'),
    access_token_url='https://github.com/login/oauth/access_token',
    access_token_params=None,
    authorize_url='https://github.com/login/oauth/authorize',
    authorize_params=None,
    api_base_url='https://api.github.com/',
    client_kwargs={'scope': 'user:email'},
)

@app.get('/login/google')
async def login_google(request: Request):
    redirect_uri = request.url_for('auth_google')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get('/auth/google')
async def auth_google(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user = token.get('userinfo')
    if user:
        return {"email": user['email'], "name": user['name']}
    return {"error": "登录失败"}

@app.get('/login/github')
async def login_github(request: Request):
    redirect_uri = request.url_for('auth_github')
    return await oauth.github.authorize_redirect(request, redirect_uri)

@app.get('/auth/github')
async def auth_github(request: Request):
    token = await oauth.github.authorize_access_token(request)
    resp = await oauth.github.get('user', token=token)
    profile = resp.json()
    return {"username": profile['login'], "name": profile['name']}
\`\`\`

---

## 二、Scope权限范围

### 2.1 Scope设计与使用

\`\`\`python
from fastapi import Security, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, SecurityScopes

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="token",
    scopes={
        "articles:read": "读取文章",
        "articles:write": "创建和修改文章",
        "articles:delete": "删除文章",
        "users:read": "读取用户信息",
        "users:write": "修改用户信息",
        "admin": "管理员权限"
    }
)

async def get_current_user(
    security_scopes: SecurityScopes,
    token: str = Depends(oauth2_scheme)
):
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        token_scopes = payload.get("scopes", [])
        username = payload.get("sub")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无法验证凭据",
            headers={"WWW-Authenticate": authenticate_value}
        )

    for scope in security_scopes.scopes:
        if scope not in token_scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"权限不足，需要: {scope}",
                headers={"WWW-Authenticate": authenticate_value}
            )

    return {"username": username, "scopes": token_scopes}
\`\`\`

### 2.2 分层权限控制

\`\`\`python
# 只读权限
@app.get("/articles/")
async def list_articles(
    current_user=Security(get_current_user, scopes=["articles:read"])
):
    return []

# 写权限
@app.post("/articles/")
async def create_article(
    current_user=Security(get_current_user, scopes=["articles:write"])
):
    return {}

# 管理员权限
@app.delete("/admin/articles/{article_id}")
async def delete_article(
    article_id: int,
    current_user=Security(get_current_user, scopes=["admin"])
):
    return {}
\`\`\`

---

## 三、API Key认证

### 3.1 API Key实现

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, status, Security
from fastapi.security import APIKeyHeader, APIKeyQuery, APIKeyCookie
from pydantic import BaseModel

app = FastAPI()

# API Key位置选项
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)
api_key_query = APIKeyQuery(name="api_key", auto_error=False)
api_key_cookie = APIKeyCookie(name="api_key", auto_error=False)

# 模拟API Key存储
API_KEYS = {
    "sk-abc123xyz": {"owner": "user1", "rate_limit": 1000},
    "sk-def456uvw": {"owner": "user2", "rate_limit": 5000},
}

async def get_api_key(
    api_key_header: str = Security(api_key_header),
    api_key_query: str = Security(api_key_query),
    api_key_cookie: str = Security(api_key_cookie),
):
    api_key = api_key_header or api_key_query or api_key_cookie
    if api_key and api_key in API_KEYS:
        return API_KEYS[api_key]
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的API Key",
    )

# 使用
@app.get("/api/protected")
async def protected_route(api_key: dict = Depends(get_api_key)):
    return {"message": f"欢迎, {api_key['owner']}"}
\`\`\`

### 3.2 API Key管理最佳实践

\`\`\`python
import secrets
import hashlib
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

class APIKeyModel(Base):
    __tablename__ = "api_keys"
    id = Column(Integer, primary_key=True)
    key_hash = Column(String, unique=True, index=True)
    prefix = Column(String(10))  # 显示前10位
    owner_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    scopes = Column(String)  # JSON格式存储权限
    rate_limit = Column(Integer, default=1000)
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime)

def generate_api_key() -> tuple:
    raw_key = f"sk-{secrets.token_urlsafe(32)}"
    prefix = raw_key[:10]
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    return raw_key, prefix, key_hash

def verify_api_key(raw_key: str, db: Session) -> dict:
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    api_key = db.query(APIKeyModel).filter(
        APIKeyModel.key_hash == key_hash,
        APIKeyModel.is_active == True
    ).first()
    if not api_key:
        return None
    if api_key.expires_at and api_key.expires_at < datetime.utcnow():
        return None
    # 更新最后使用时间
    api_key.last_used_at = datetime.utcnow()
    db.commit()
    return api_key
\`\`\`

---

## 四、HTTP Basic认证

### 4.1 HTTP Basic实现

\`\`\`python
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets

app = FastAPI()
security = HTTPBasic()

# 用户数据库（实际应从数据库查询）
users_db = {
    "admin": {
        "username": "admin",
        "hashed_password": get_password_hash("admin123")
    }
}

def verify_credentials(credentials: HTTPBasicCredentials = Depends(security)):
    user = users_db.get(credentials.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Basic"},
        )
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

@app.get("/basic-auth")
def basic_auth_route(username: str = Depends(verify_credentials)):
    return {"message": f"欢迎, {username}"}
\`\`\`

### 4.2 注意事项

1. **必须使用HTTPS**：Base64编码不是加密，仅HTTPS下安全
2. **无状态**：每次请求都需要验证
3. **不适合前端**：浏览器会弹出原生登录框，体验较差
4. **适用场景**：内部API、测试环境、简单服务

---

## 五、多种安全方案组合

### 5.1 多认证方式支持

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, APIKeyHeader
from typing import Optional

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    api_key: Optional[str] = Depends(api_key_header),
    db: Session = Depends(get_db)
):
    # 尝试JWT认证
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user = db.query(User).filter(
                User.username == payload.get("sub")
            ).first()
            if user:
                return user, "jwt"
        except JWTError:
            pass

    # 尝试API Key认证
    if api_key:
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        api_key_obj = db.query(APIKeyModel).filter(
            APIKeyModel.key_hash == key_hash,
            APIKeyModel.is_active == True
        ).first()
        if api_key_obj:
            user = db.query(User).get(api_key_obj.owner_id)
            if user:
                return user, "api_key"

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="认证失败",
        headers={"WWW-Authenticate": "Bearer"},
    )

@app.get("/multi-auth")
async def multi_auth(auth_result=Depends(get_current_user)):
    user, auth_type = auth_result
    return {
        "message": f"欢迎, {user.username}",
        "auth_type": auth_type
    }
\`\`\`

### 5.2 条件认证

\`\`\`python
from fastapi import Request

async def optional_auth(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """可选认证：有token返回用户，无token返回None"""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return db.query(User).filter(
            User.username == payload.get("sub")
        ).first()
    except JWTError:
        return None

@app.get("/articles")
async def get_articles(
    current_user: Optional[User] = Depends(optional_auth),
    db: Session = Depends(get_db)
):
    query = db.query(Article).filter(Article.published == True)
    if current_user:
        # 登录用户可以看到自己的草稿
        query = db.query(Article).filter(
            (Article.published == True) |
            (Article.author_id == current_user.id)
        )
    return query.all()
\`\`\`

---

## 六、安全中间件与CORS

### 6.1 CORS配置

\`\`\`python
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "https://example.com",
    "https://www.example.com",
    "http://localhost:3000",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 生产环境不要用 ["*"]
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,  # 预检请求缓存时间
)
\`\`\`

### 6.2 安全响应头

\`\`\`python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=()"
        return response

app.add_middleware(SecurityHeadersMiddleware)
\`\`\`

---

## 七、最佳实践与常见坑点

### 7.1 认证方案对比表

| 方案 | 适用场景 | 优点 | 缺点 |
|------|---------|------|------|
| OAuth2 Password | 前后端分离应用 | 标准、安全、支持刷新 | 实现稍复杂 |
| OAuth2 Authorization Code | 第三方登录 | 最安全 | 流程复杂 |
| API Key | 服务间调用、开放API | 简单、易管理 | 需妥善保管 |
| HTTP Basic | 内部系统、测试 | 最简单 | 仅HTTPS下安全 |
| Session Cookie | 传统Web应用 | 浏览器原生支持 | 有CSRF风险 |

### 7.2 安全最佳实践

1. **始终使用HTTPS**：所有认证方案都依赖HTTPS
2. **最小权限原则**：Scopes只分配必要的权限
3. **Token轮换**：Refresh Token每次使用后轮换
4. **速率限制**：登录接口添加限流防止暴力破解
5. **审计日志**：记录所有认证和授权事件
6. **密钥轮换**：定期更换签名密钥和API Key

### 7.3 常见坑点

**坑点1：CORS配置使用allow_origins=["*"]同时开启allow_credentials**

\`\`\`python
# 错误：这是无效配置，浏览器会拒绝
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,  # 错误！
)

# 正确：明确指定允许的域名
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://example.com"],
    allow_credentials=True,
)
\`\`\`

**坑点2：API Key明文存储**

\`\`\`python
# 错误：API Key明文存储，数据库泄露则全部失效
api_key = Column(String)

# 正确：只存储哈希值，显示时只显示前缀
key_hash = Column(String)  # SHA256哈希
prefix = Column(String(10))  # 前10位用于显示
\`\`\`

**坑点3：auto_error=True导致多认证失败**

\`\`\`python
# 错误：第一个认证失败直接返回401，不尝试后续认证
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=True)

# 正确：设置auto_error=False，手动处理认证失败
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
\`\`\`
`
  },
  {
    id: "pyb-13-4",
    group: "FastAPI进阶实战",
    icon: "🔥",
    title: "WebSocket支持",
    content: `

# WebSocket支持

## 一、WebSocket基础

### 1.1 WebSocket路由基础

\`\`\`python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"消息已收到: {data}")
    except WebSocketDisconnect:
        print("客户端已断开连接")
\`\`\`

### 1.2 连接生命周期

\`\`\`python
@app.websocket("/ws/lifecycle")
async def websocket_lifecycle(websocket: WebSocket):
    # 1. 连接建立前可以做一些验证
    query_params = websocket.query_params
    token = query_params.get("token")
    if not token:
        await websocket.close(code=1008, reason="未提供认证Token")
        return

    # 2. 接受连接
    await websocket.accept()
    await websocket.send_text("连接已建立")

    try:
        # 3. 消息循环
        while True:
            # 接收消息
            data = await websocket.receive_text()
            print(f"收到消息: {data}")

            # 发送消息
            await websocket.send_text(f"服务器回复: {data}")

            # 发送JSON
            await websocket.send_json({
                "type": "message",
                "content": data,
                "timestamp": datetime.utcnow().isoformat()
            })

            # 发送字节数据
            # await websocket.send_bytes(b"binary data")

    except WebSocketDisconnect as e:
        # 客户端断开连接
        print(f"连接断开，code: {e.code}, reason: {e.reason}")
    except Exception as e:
        print(f"发生错误: {e}")
        await websocket.close(code=1011, reason="服务器内部错误")
\`\`\`

---

## 二、聊天室实战

### 2.1 连接管理器

\`\`\`python
from typing import List, Dict, Set
from collections import defaultdict
import json

class ConnectionManager:
    def __init__(self):
        # 所有活跃连接
        self.active_connections: List[WebSocket] = []
        # 按房间分组的连接
        self.room_connections: Dict[str, Set[WebSocket]] = defaultdict(set)
        # 连接对应的用户信息
        self.connection_user: Dict[WebSocket, dict] = {}

    async def connect(self, websocket: WebSocket, user: dict = None, room: str = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if user:
            self.connection_user[websocket] = user
        if room:
            self.room_connections[room].add(websocket)

    def disconnect(self, websocket: WebSocket, room: str = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.connection_user:
            del self.connection_user[websocket]
        if room and websocket in self.room_connections[room]:
            self.room_connections[room].remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

    async def broadcast_to_room(self, message: str, room: str):
        if room in self.room_connections:
            for connection in self.room_connections[room]:
                await connection.send_text(message)

    def get_online_users(self) -> List[dict]:
        return [
            self.connection_user[conn]
            for conn in self.active_connections
            if conn in self.connection_user
        ]

manager = ConnectionManager()
\`\`\`

### 2.2 聊天室实现

\`\`\`python
@app.websocket("/ws/chat/{room}")
async def chat_room(websocket: WebSocket, room: str, token: str = None):
    # 认证
    user = None
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user = {"username": payload.get("sub")}
        except JWTError:
            await websocket.close(code=1008, reason="认证失败")
            return

    if not user:
        await websocket.close(code=1008, reason="请先登录")
        return

    await manager.connect(websocket, user=user, room=room)

    # 通知房间有新用户加入
    await manager.broadcast_to_room(
        json.dumps({
            "type": "system",
            "content": f"{user['username']} 加入了聊天室",
            "timestamp": datetime.utcnow().isoformat()
        }),
        room
    )

    # 发送在线用户列表
    await manager.send_personal_message(
        json.dumps({
            "type": "online_users",
            "users": [u["username"] for u in manager.get_online_users()]
        }),
        websocket
    )

    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)

            if message_data["type"] == "message":
                await manager.broadcast_to_room(
                    json.dumps({
                        "type": "message",
                        "username": user["username"],
                        "content": message_data["content"],
                        "timestamp": datetime.utcnow().isoformat()
                    }),
                    room
                )
            elif message_data["type"] == "typing":
                await manager.broadcast_to_room(
                    json.dumps({
                        "type": "typing",
                        "username": user["username"]
                    }),
                    room
                )

    except WebSocketDisconnect:
        manager.disconnect(websocket, room)
        await manager.broadcast_to_room(
            json.dumps({
                "type": "system",
                "content": f"{user['username']} 离开了聊天室"
            }),
            room
        )
\`\`\`

---

## 三、心跳与断开检测

### 3.1 心跳机制实现

\`\`\`python
import asyncio
from datetime import datetime, timedelta

@app.websocket("/ws/heartbeat")
async def websocket_heartbeat(websocket: WebSocket):
    await websocket.accept()

    # 心跳配置
    HEARTBEAT_INTERVAL = 30  # 每30秒发送一次ping
    HEARTBEAT_TIMEOUT = 10   # 10秒没收到pong则超时

    last_pong_time = datetime.utcnow()

    async def send_heartbeat():
        nonlocal last_pong_time
        while True:
            await asyncio.sleep(HEARTBEAT_INTERVAL)
            try:
                # 检查上次pong时间
                if datetime.utcnow() - last_pong_time > timedelta(seconds=HEARTBEAT_INTERVAL + HEARTBEAT_TIMEOUT):
                    print("心跳超时，关闭连接")
                    await websocket.close(code=1011, reason="心跳超时")
                    return

                await websocket.send_json({"type": "ping"})
            except Exception as e:
                print(f"发送心跳失败: {e}")
                return

    # 启动心跳任务
    heartbeat_task = asyncio.create_task(send_heartbeat())

    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "pong":
                last_pong_time = datetime.utcnow()
            else:
                # 处理其他消息
                pass
    except WebSocketDisconnect:
        pass
    finally:
        heartbeat_task.cancel()
\`\`\`

### 3.2 自动重连客户端示例

\`\`\`javascript
class ReconnectingWebSocket {
    constructor(url, options = {}) {
        this.url = url;
        this.options = options;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
        this.reconnectDelay = options.reconnectDelay || 1000;
        this.ws = null;
        this.heartbeatInterval = null;
        this.connect();
    }

    connect() {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log('WebSocket连接已建立');
            this.reconnectAttempts = 0;
            this.startHeartbeat();
            if (this.options.onOpen) this.options.onOpen();
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'ping') {
                this.send({ type: 'pong' });
                return;
            }
            if (this.options.onMessage) this.options.onMessage(data);
        };

        this.ws.onclose = () => {
            console.log('WebSocket连接已关闭');
            this.stopHeartbeat();
            this.scheduleReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket错误:', error);
        };
    }

    send(data) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            this.send({ type: 'ping' });
        }, 25000);
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
    }

    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('达到最大重连次数');
            return;
        }

        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
        console.log(\`\${delay}ms后尝试第\${this.reconnectAttempts + 1}次重连...\`);

        setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
        }, delay);
    }
}
\`\`\`

---

## 四、WebSocket认证

### 4.1 查询参数认证

\`\`\`python
from urllib.parse import parse_qs

@app.websocket("/ws/auth")
async def websocket_auth(websocket: WebSocket):
    # 从查询参数获取token
    query_params = parse_qs(websocket.url.query)
    token = query_params.get("token", [None])[0]

    if not token:
        await websocket.close(code=1008, reason="缺少认证Token")
        return

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user = db.query(User).filter(
            User.username == payload.get("sub")
        ).first()
    except JWTError:
        await websocket.close(code=1008, reason="无效的Token")
        return

    if not user:
        await websocket.close(code=1008, reason="用户不存在")
        return

    await websocket.accept()
    # 认证通过...
\`\`\`

### 4.2 首次消息认证

\`\`\`python
@app.websocket("/ws/auth-message")
async def websocket_auth_message(websocket: WebSocket):
    await websocket.accept()

    try:
        # 等待认证消息（30秒超时）
        auth_data = await asyncio.wait_for(
            websocket.receive_json(),
            timeout=30
        )

        if auth_data.get("type") != "auth":
            await websocket.send_json({"type": "error", "message": "请先发送认证消息"})
            await websocket.close(code=1008)
            return

        token = auth_data.get("token")
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user = db.query(User).filter(
                User.username == payload.get("sub")
            ).first()
        except JWTError:
            await websocket.send_json({"type": "error", "message": "认证失败"})
            await websocket.close(code=1008)
            return

        # 认证成功
        await websocket.send_json({"type": "auth_success"})

        # 开始正常消息处理
        while True:
            data = await websocket.receive_json()
            # 处理业务消息...

    except asyncio.TimeoutError:
        await websocket.send_json({"type": "error", "message": "认证超时"})
        await websocket.close(code=1008)
    except WebSocketDisconnect:
        pass
\`\`\`

### 4.3 Cookie认证

\`\`\`python
@app.websocket("/ws/cookie-auth")
async def websocket_cookie_auth(websocket: WebSocket):
    cookies = websocket.cookies
    access_token = cookies.get("access_token")

    if access_token and access_token.startswith("Bearer "):
        token = access_token[7:]
        # 验证token...
    else:
        await websocket.close(code=1008)
        return

    await websocket.accept()
\`\`\`

---

## 五、消息队列与Redis Pub/Sub

### 5.1 多实例广播问题与解决方案

单进程的连接管理器在多实例部署时无法跨实例广播。使用Redis Pub/Sub解决：

\`\`\`python
import aioredis
import json

redis = aioredis.from_url("redis://localhost")

class PubSubManager:
    def __init__(self):
        self.local_connections: Dict[str, Set[WebSocket]] = defaultdict(set)
        self.pubsub = None

    async def connect(self, websocket: WebSocket, channel: str, user: dict):
        await websocket.accept()
        self.local_connections[channel].add(websocket)

    async def disconnect(self, websocket: WebSocket, channel: str):
        if websocket in self.local_connections[channel]:
            self.local_connections[channel].remove(websocket)

    async def subscribe(self, channel: str):
        """订阅Redis频道"""
        async def reader():
            pubsub = redis.pubsub()
            await pubsub.subscribe(channel)
            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = message["data"].decode()
                    # 转发给本地连接
                    for ws in self.local_connections.get(channel, set()):
                        try:
                            await ws.send_text(data)
                        except Exception:
                            pass

        asyncio.create_task(reader())

    async def publish(self, channel: str, message: dict):
        """发布消息到Redis"""
        await redis.publish(channel, json.dumps(message))

pubsub_manager = PubSubManager()

@app.on_event("startup")
async def startup():
    await pubsub_manager.subscribe("chat_room")
    await pubsub_manager.subscribe("notifications")
\`\`\`

---

## 六、最佳实践与常见坑点

### 6.1 WebSocket最佳实践

1. **始终实现心跳**：防止中间代理(如Nginx)断开空闲连接
2. **优雅断开**：处理WebSocketDisconnect异常
3. **消息认证**：连接建立后立即认证，设置超时
4. **消息序列化**：使用JSON统一消息格式，定义type字段
5. **错误处理**：捕获所有异常，避免连接崩溃
6. **消息限流**：防止恶意用户发送大量消息
7. **广播优化**：使用Redis Pub/Sub支持多实例部署

### 6.2 WebSocket关闭状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|---------|
| 1000 | 正常关闭 | 正常结束连接 |
| 1001 | 端点离开 | 服务器关闭或页面跳转 |
| 1002 | 协议错误 | 协议错误 |
| 1003 | 不支持的数据 | 接收不支持的消息类型 |
| 1008 | 违反策略 | 认证失败、权限不足 |
| 1011 | 服务器错误 | 服务器内部错误 |

### 6.3 常见坑点

**坑点1：忘记accept连接**

\`\`\`python
# 错误：没有accept就尝试收发消息
@app.websocket("/ws")
async def bad_endpoint(websocket: WebSocket):
    await websocket.send_text("hello")  # 报错！

# 正确：先accept
@app.websocket("/ws")
async def good_endpoint(websocket: WebSocket):
    await websocket.accept()  # 必须先调用
    await websocket.send_text("hello")
\`\`\`

**坑点2：阻塞事件循环**

\`\`\`python
# 错误：使用同步IO阻塞事件循环
@app.websocket("/ws")
async def blocking_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        time.sleep(5)  # 阻塞！所有连接都会卡住
        await websocket.send_text(data)

# 正确：使用异步IO
@app.websocket("/ws")
async def non_blocking_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await asyncio.sleep(5)  # 不阻塞
        await websocket.send_text(data)
\`\`\`

**坑点3：Nginx代理WebSocket配置**

\`\`\`nginx
location /ws {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 300s;  # 必须配置，否则60秒断开
    proxy_send_timeout 300s;
}
\`\`\`
`
  },
  {
    id: "pyb-13-5",
    group: "FastAPI进阶实战",
    icon: "🔥",
    title: "后台任务与异步处理",
    content: `

# 后台任务与异步处理

## 一、BackgroundTasks基础

### 1.1 BackgroundTasks使用

\`\`\`python
from fastapi import FastAPI, BackgroundTasks, Depends
from pydantic import BaseModel, EmailStr
import time

app = FastAPI()

def send_email_notification(email: str, message: str):
    """模拟发送邮件"""
    time.sleep(5)  # 模拟耗时操作
    print(f"邮件已发送到 {email}: {message}")

def write_log(message: str):
    """写入日志"""
    with open("log.txt", "a") as f:
        f.write(f"{time.ctime()}: {message}\n")

@app.post("/register")
async def register(
    email: str,
    background_tasks: BackgroundTasks
):
    # 添加后台任务
    background_tasks.add_task(send_email_notification, email, "欢迎注册！")
    background_tasks.add_task(write_log, f"新用户注册: {email}")

    return {"message": "注册成功，邮件将在后台发送"}
\`\`\`

### 1.2 BackgroundTasks依赖注入

\`\`\`python
from fastapi import BackgroundTasks

def process_data(data_id: int, background_tasks: BackgroundTasks):
    """在依赖中添加后台任务"""
    background_tasks.add_task(write_log, f"开始处理数据 {data_id}")
    return {"data_id": data_id}

@app.post("/process")
async def process(
    data=Depends(process_data),
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(write_log, f"数据 {data['data_id']} 处理完成")
    return {"message": "处理中"}
\`\`\`

---

## 二、BackgroundTasks与Celery对比

### 2.1 对比表

| 特性 | BackgroundTasks | Celery |
|------|----------------|--------|
| 部署复杂度 | 极低，无需额外组件 | 需要Broker(Redis/RabbitMQ) |
| 持久化 | 不支持，进程重启丢失 | 支持，任务持久化 |
| 重试机制 | 无 | 内置自动重试 |
| 定时任务 | 不支持 | 支持Celery Beat |
| 任务监控 | 无 | Flower监控 |
| 分布式 | 单进程 | 支持多Worker分布式 |
| 任务优先级 | 不支持 | 支持队列优先级 |
| 适用场景 | 简单、短任务、可丢失 | 复杂、长任务、高可靠 |

### 2.2 如何选择

- **使用BackgroundTasks**：发送邮件/短信、写日志、轻量数据处理等简单任务
- **使用Celery**：报表生成、视频处理、批量数据导入、需要重试/定时的任务

---

## 三、asyncio.create_task

### 3.1 基本使用

\`\`\`python
import asyncio
from fastapi import FastAPI

app = FastAPI()

async def long_running_task(task_id: int):
    """模拟长耗时异步任务"""
    await asyncio.sleep(10)
    print(f"任务 {task_id} 完成")
    return {"task_id": task_id, "status": "completed"}

@app.post("/start-task/{task_id}")
async def start_task(task_id: int):
    # 创建后台任务，不等待完成
    task = asyncio.create_task(long_running_task(task_id))

    # 可选：添加回调
    def task_callback(fut):
        try:
            result = fut.result()
            print(f"任务回调: {result}")
        except Exception as e:
            print(f"任务失败: {e}")

    task.add_done_callback(task_callback)

    return {"message": f"任务 {task_id} 已启动", "task_id": task_id}
\`\`\`

### 3.2 任务状态跟踪

\`\`\`python
from typing import Dict
from enum import Enum

class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

tasks_db: Dict[int, dict] = {}

async def trackable_task(task_id: int):
    tasks_db[task_id] = {"status": TaskStatus.RUNNING, "result": None}
    try:
        await asyncio.sleep(10)  # 模拟工作
        tasks_db[task_id] = {
            "status": TaskStatus.COMPLETED,
            "result": {"message": "任务完成"},
            "completed_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        tasks_db[task_id] = {
            "status": TaskStatus.FAILED,
            "error": str(e)
        }

@app.post("/tasks")
async def create_task():
    task_id = len(tasks_db) + 1
    tasks_db[task_id] = {"status": TaskStatus.PENDING}
    asyncio.create_task(trackable_task(task_id))
    return {"task_id": task_id}

@app.get("/tasks/{task_id}")
async def get_task(task_id: int):
    if task_id not in tasks_db:
        raise HTTPException(status_code=404, detail="任务不存在")
    return tasks_db[task_id]
\`\`\`

---

## 四、长任务进度推送(SSE)

### 4.1 Server-Sent Events基础

\`\`\`python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio
import json

app = FastAPI()

async def event_generator():
    """SSE事件生成器"""
    for i in range(1, 11):
        # SSE格式要求
        yield f"data: {json.dumps({'progress': i * 10, 'message': f'处理中... {i * 10}%'})}\n\n"
        await asyncio.sleep(1)
    yield f"data: {json.dumps({'progress': 100, 'message': '完成!'})}\n\n"
    yield "data: [DONE]\n\n"

@app.get("/sse/progress")
async def sse_progress():
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # 禁用Nginx缓冲
        }
    )
\`\`\`

### 4.2 实际任务进度推送

\`\`\`python
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime

@dataclass
class TaskProgress:
    task_id: int
    status: str = "pending"
    progress: int = 0
    message: str = ""
    result: Optional[dict] = None
    error: Optional[str] = None
    queue: asyncio.Queue = field(default_factory=asyncio.Queue)

    async def update(self, progress: int, message: str):
        self.progress = progress
        self.message = message
        await self.queue.put({
            "type": "progress",
            "progress": progress,
            "message": message
        })

    async def complete(self, result: dict):
        self.status = "completed"
        self.result = result
        await self.queue.put({
            "type": "completed",
            "result": result
        })

    async def fail(self, error: str):
        self.status = "failed"
        self.error = error
        await self.queue.put({
            "type": "error",
            "error": error
        })

tasks: Dict[int, TaskProgress] = {}

async def long_task_with_progress(task_id: int):
    task = tasks[task_id]
    task.status = "running"
    try:
        steps = [
            (10, "开始处理..."),
            (30, "数据验证中..."),
            (50, "处理中..."),
            (70, "生成报告..."),
            (90, "保存结果..."),
            (100, "完成!")
        ]
        for progress, message in steps:
            await asyncio.sleep(1)
            await task.update(progress, message)
        await task.complete({"report_url": f"/reports/{task_id}.pdf"})
    except Exception as e:
        await task.fail(str(e))

@app.post("/long-task")
async def start_long_task():
    task_id = len(tasks) + 1
    task = TaskProgress(task_id=task_id)
    tasks[task_id] = task
    asyncio.create_task(long_task_with_progress(task_id))
    return {"task_id": task_id}

@app.get("/long-task/{task_id}/stream")
async def stream_task_progress(task_id: int):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="任务不存在")

    task = tasks[task_id]

    async def generate():
        try:
            while True:
                event = await asyncio.wait_for(
                    task.queue.get(),
                    timeout=30
                )
                yield f"data: {json.dumps(event)}\n\n"
                if event["type"] in ["completed", "error"]:
                    break
        except asyncio.TimeoutError:
            yield f"data: {json.dumps({'type': 'ping'})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )
\`\`\`

---

## 五、定时任务(APScheduler)

### 5.1 APScheduler集成

\`\`\`bash
pip install apscheduler
\`\`\`

\`\`\`python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.date import DateTrigger
from datetime import datetime, timedelta

scheduler = AsyncIOScheduler()

# 定义任务
def scheduled_job():
    print(f"定时任务执行: {datetime.now()}")

async def async_scheduled_job():
    print(f"异步定时任务执行: {datetime.now()}")
    await asyncio.sleep(1)

@app.on_event("startup")
async def start_scheduler():
    # 间隔任务：每30秒执行一次
    scheduler.add_job(
        scheduled_job,
        trigger=IntervalTrigger(seconds=30),
        id="interval_job",
        name="间隔任务示例"
    )

    # Cron任务：每天凌晨2点执行
    scheduler.add_job(
        async_scheduled_job,
        trigger=CronTrigger(hour=2, minute=0),
        id="daily_backup",
        name="每日备份"
    )

    # Cron表达式：每周一至周五9点
    scheduler.add_job(
        scheduled_job,
        trigger=CronTrigger(day_of_week="mon-fri", hour=9, minute=0),
        id="weekday_morning"
    )

    # 指定日期执行一次
    scheduler.add_job(
        scheduled_job,
        trigger=DateTrigger(
            run_date=datetime.now() + timedelta(hours=1)
        ),
        id="one_time_job"
    )

    scheduler.start()

@app.on_event("shutdown")
async def shutdown_scheduler():
    scheduler.shutdown()
\`\`\`

### 5.2 动态管理定时任务

\`\`\`python
from pydantic import BaseModel

class CronJobCreate(BaseModel):
    job_id: str
    cron_expression: str  # 如: "0 2 * * *"
    name: str

@app.post("/scheduler/jobs")
async def create_job(job_data: CronJobCreate):
    """动态添加定时任务"""
    parts = job_data.cron_expression.split()
    trigger = CronTrigger(
        minute=parts[0],
        hour=parts[1],
        day=parts[2],
        month=parts[3],
        day_of_week=parts[4]
    )
    scheduler.add_job(
        scheduled_job,
        trigger=trigger,
        id=job_data.job_id,
        name=job_data.name
    )
    return {"message": "任务已添加"}

@app.get("/scheduler/jobs")
async def list_jobs():
    """列出所有任务"""
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
            "trigger": str(job.trigger)
        })
    return jobs

@app.delete("/scheduler/jobs/{job_id}")
async def delete_job(job_id: str):
    """删除任务"""
    job = scheduler.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="任务不存在")
    job.remove()
    return {"message": "任务已删除"}

@app.post("/scheduler/jobs/{job_id}/pause")
async def pause_job(job_id: str):
    scheduler.pause_job(job_id)
    return {"message": "任务已暂停"}

@app.post("/scheduler/jobs/{job_id}/resume")
async def resume_job(job_id: str):
    scheduler.resume_job(job_id)
    return {"message": "任务已恢复"}
\`\`\`

---

## 六、Celery集成

### 6.1 Celery配置

\`\`\`python
# celery_app.py
from celery import Celery
from kombu import Exchange, Queue

celery_app = Celery(
    "tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1",
    broker_connection_retry_on_startup=True
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Shanghai",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,
    task_queues=(
        Queue("default", Exchange("default"), routing_key="default"),
        Queue("high_priority", Exchange("high"), routing_key="high.#"),
        Queue("low_priority", Exchange("low"), routing_key="low.#"),
    ),
    task_routes={
        "tasks.send_email": {"queue": "default"},
        "tasks.generate_report": {"queue": "low_priority"},
        "tasks.payment_process": {"queue": "high_priority"},
    }
)
\`\`\`

### 6.2 任务定义

\`\`\`python
# tasks.py
from celery_app import celery_app
import time
import smtplib
from email.mime.text import MIMEText

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_email(self, to_email: str, subject: str, content: str):
    """发送邮件，失败重试3次"""
    try:
        msg = MIMEText(content)
        msg["Subject"] = subject
        msg["From"] = "sender@example.com"
        msg["To"] = to_email

        # 模拟发送邮件
        time.sleep(2)
        print(f"邮件已发送到 {to_email}")
        return {"status": "success", "to": to_email}
    except Exception as e:
        # 重试
        raise self.retry(exc=e)

@celery_app.task(bind=True)
def generate_report(self, report_id: int):
    """生成报表"""
    total_steps = 10
    for i in range(total_steps):
        time.sleep(1)
        # 更新任务状态
        self.update_state(
            state="PROGRESS",
            meta={"current": i + 1, "total": total_steps, "percent": (i + 1) * 10}
        )
    return {"report_id": report_id, "status": "completed", "url": f"/reports/{report_id}.pdf"}
\`\`\`

### 6.3 FastAPI中调用Celery

\`\`\`python
from tasks import send_email, generate_report
from celery.result import AsyncResult

@app.post("/send-email")
async def send_email_endpoint(to_email: str, subject: str, content: str):
    task = send_email.delay(to_email, subject, content)
    return {"task_id": task.id, "message": "邮件发送任务已提交"}

@app.post("/generate-report")
async def create_report():
    task = generate_report.delay(report_id=123)
    return {"task_id": task.id}

@app.get("/tasks/{task_id}")
async def get_task_status(task_id: str):
    result = AsyncResult(task_id)
    if result.state == "PENDING":
        return {"state": result.state, "status": "等待中"}
    elif result.state == "PROGRESS":
        return {"state": result.state, "progress": result.info}
    elif result.state == "SUCCESS":
        return {"state": result.state, "result": result.get()}
    else:
        return {"state": result.state, "error": str(result.info)}
\`\`\`

---

## 七、最佳实践与常见坑点

### 7.1 异步处理方案选择指南

| 任务类型 | 推荐方案 | 原因 |
|---------|---------|------|
| 发邮件/短信 | BackgroundTasks/Celery | 简单，不需要重试 |
| 日志/审计 | BackgroundTasks | 轻量，不影响主流程 |
| 报表/导出 | Celery | 耗时长，需要进度 |
| 视频转码 | Celery + 专用Worker | CPU密集，需要隔离 |
| 定时任务 | APScheduler/Celery Beat | 内置调度 |
| 实时进度 | SSE/WebSocket | 需要前端实时反馈 |

### 7.2 常见坑点

**坑点1：BackgroundTasks中使用同步阻塞操作**

\`\`\`python
# 错误：同步阻塞会影响其他请求
def send_email_blocking():
    time.sleep(10)  # 阻塞事件循环

@app.post("/wrong")
async def wrong_way(background_tasks: BackgroundTasks):
    background_tasks.add_task(send_email_blocking)
    return {}

# 正确：在线程池中运行同步任务
import asyncio
import functools

async def run_in_threadpool(func, *args, **kwargs):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None, functools.partial(func, *args, **kwargs)
    )

async def send_email_async():
    await run_in_threadpool(send_email_blocking)
\`\`\`

**坑点2：create_task后不持有引用导致任务被垃圾回收**

\`\`\`python
# 错误：任务可能被GC
@app.post("/bad-task")
async def bad_task():
    asyncio.create_task(long_running_task())  # 没有保存引用
    return {}

# 正确：持有任务引用
background_tasks_set = set()

@app.post("/good-task")
async def good_task():
    task = asyncio.create_task(long_running_task())
    background_tasks_set.add(task)
    task.add_done_callback(background_tasks_set.discard)
    return {}
\`\`\`

**坑点3：APScheduler在多worker下重复执行**

多进程部署时APScheduler会重复执行任务，解决方案：
1. 使用Celery Beat代替
2. 使用分布式锁（Redis Lock）
3. 单独部署一个scheduler进程
4. 使用数据库锁

\`\`\`python
from redis import Redis
from redis.exceptions import LockError

redis = Redis()

@app.on_event("startup")
async def start_scheduler():
    try:
        # 获取分布式锁，确保只有一个实例执行调度
        with redis.lock("scheduler_lock", blocking_timeout=1, timeout=60):
            scheduler.start()
    except LockError:
        print("其他实例已启动scheduler")
\`\`\`
`
  },
  {
    id: "pyb-13-6",
    group: "FastAPI进阶实战",
    icon: "🔥",
    title: "FastAPI测试",
    content: `

# FastAPI测试

## 一、TestClient测试客户端

### 1.1 基础测试配置

\`\`\`bash
pip install pytest httpx pytest-asyncio
\`\`\`

\`\`\`python
from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

def test_read_item():
    response = client.get("/items/42?q=test")
    assert response.status_code == 200
    assert response.json() == {"item_id": 42, "q": "test"}

def test_read_item_bad_id():
    response = client.get("/items/abc")
    assert response.status_code == 422
\`\`\`

### 1.2 pytest测试结构

\`\`\`
tests/
├── conftest.py          # pytest配置和fixture
├── test_main.py         # 主路由测试
├── test_auth.py         # 认证测试
├── test_users.py        # 用户接口测试
└── test_items.py        # 项目接口测试
\`\`\`

\`\`\`python
# conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

# 测试数据库
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    yield from override_get_db()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client():
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def auth_headers(client):
    """获取认证头"""
    response = client.post(
        "/token",
        data={"username": "testuser", "password": "testpass"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
\`\`\`

---

## 二、pytest+httpx异步测试

### 2.1 异步测试基础

\`\`\`python
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_async_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200

@pytest.mark.asyncio
async def test_async_create_user():
    async with AsyncClient(app=app, base_url="http://test") as client:
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpass123"
        }
        response = await client.post("/users/", json=user_data)
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == user_data["email"]
        assert "id" in data
\`\`\`

### 2.2 异步fixture

\`\`\`python
@pytest_asyncio.fixture
async def async_client():
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest_asyncio.fixture
async def authenticated_client(async_client):
    """已认证的异步客户端"""
    response = await async_client.post(
        "/token",
        data={"username": "testuser", "password": "testpass"}
    )
    token = response.json()["access_token"]
    async_client.headers["Authorization"] = f"Bearer {token}"
    return async_client

@pytest.mark.asyncio
async def test_protected_endpoint(authenticated_client):
    response = await authenticated_client.get("/users/me")
    assert response.status_code == 200
\`\`\`

---

## 三、依赖覆盖(dependency_overrides)

### 3.1 覆盖数据库依赖

\`\`\`python
from unittest.mock import Mock, MagicMock

def test_with_mock_db():
    mock_db = Mock()
    mock_db.query.return_value.filter.return_value.first.return_value = {
        "id": 1, "username": "mockuser"
    }

    app.dependency_overrides[get_db] = lambda: mock_db
    client = TestClient(app)

    response = client.get("/users/1")
    assert response.status_code == 200

    app.dependency_overrides.clear()
\`\`\`

### 3.2 覆盖认证依赖

\`\`\`python
async def mock_get_current_user():
    return models.User(
        id=1,
        username="testuser",
        email="test@example.com",
        is_active=True
    )

def test_admin_endpoint(client):
    app.dependency_overrides[get_current_user] = mock_get_current_user

    response = client.get("/admin/dashboard")
    assert response.status_code == 200

    app.dependency_overrides.clear()
\`\`\`

### 3.3 灵活的fixture覆盖

\`\`\`python
@pytest.fixture
def user_factory():
    """创建测试用户的工厂"""
    def _make_user(id=1, username="testuser", is_admin=False):
        return models.User(
            id=id,
            username=username,
            email=f"{username}@example.com",
            is_active=True,
            role="admin" if is_admin else "user"
        )
    return _make_user

@pytest.fixture
def override_auth(user_factory):
    def _override(user=None):
        if user is None:
            user = user_factory()
        app.dependency_overrides[get_current_active_user] = lambda: user
        return user
    yield _override
    app.dependency_overrides.clear()

def test_admin_forbidden(client, override_auth, user_factory):
    regular_user = user_factory(is_admin=False)
    override_auth(regular_user)

    response = client.get("/admin/dashboard")
    assert response.status_code == 403

def test_admin_access(client, override_auth, user_factory):
    admin_user = user_factory(is_admin=True)
    override_auth(admin_user)

    response = client.get("/admin/dashboard")
    assert response.status_code == 200
\`\`\`

---

## 四、数据库测试(事务回滚)

### 4.1 事务回滚测试

\`\`\`python
from sqlalchemy.orm import Session

@pytest.fixture(scope="function")
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()

def test_create_user(db_session: Session):
    user = models.User(
        email="test@example.com",
        username="testuser",
        hashed_password="hashed"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    assert user.id is not None
    assert user.email == "test@example.com"
    # 测试结束后事务回滚，数据不会留在数据库
\`\`\`

### 4.2 CRUD操作测试

\`\`\`python
def test_crud_user(db_session: Session):
    from app.crud import crud_user
    from app.schemas import UserCreate

    # 创建
    user_in = UserCreate(
        email="test@example.com",
        username="testuser",
        password="testpass"
    )
    user = crud_user.create(db_session, obj_in=user_in)
    assert user.id is not None

    # 读取
    user_get = crud_user.get(db_session, user_id=user.id)
    assert user_get.email == user.email

    # 更新
    user_update = crud_user.update(
        db_session,
        db_obj=user,
        obj_in={"username": "newname"}
    )
    assert user_update.username == "newname"

    # 删除
    deleted_user = crud_user.remove(db_session, user_id=user.id)
    assert deleted_user.id == user.id
    assert crud_user.get(db_session, user_id=user.id) is None
\`\`\`

---

## 五、API测试模板

### 5.1 认证接口测试

\`\`\`python
class TestAuth:
    def test_login_success(self, client, db_session):
        user = crud_user.create(
            db_session,
            obj_in=UserCreate(
                email="test@example.com",
                username="testuser",
                password="testpass"
            )
        )
        response = client.post(
            "/token",
            data={"username": "testuser", "password": "testpass"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client):
        response = client.post(
            "/token",
            data={"username": "testuser", "password": "wrong"}
        )
        assert response.status_code == 401

    def test_unauthorized_access(self, client):
        response = client.get("/users/me")
        assert response.status_code == 401

    def test_refresh_token(self, client):
        login_response = client.post(
            "/token",
            data={"username": "testuser", "password": "testpass"}
        )
        refresh_token = login_response.json()["refresh_token"]

        response = client.post(
            "/refresh-token",
            json={"refresh_token": refresh_token}
        )
        assert response.status_code == 200
        assert "access_token" in response.json()
\`\`\`

### 5.2 参数化测试

\`\`\`python
import pytest

@pytest.mark.parametrize("page,size,expected_status", [
    (1, 10, 200),
    (0, 10, 422),
    (1, 0, 422),
    (1, 1000, 422),
])
def test_pagination_validation(client, page, size, expected_status):
    response = client.get(f"/items/?page={page}&size={size}")
    assert response.status_code == expected_status

@pytest.mark.parametrize("email,expected", [
    ("valid@example.com", True),
    ("invalid", False),
    ("missing@", False),
    ("@nodomain.com", False),
])
def test_email_validation(client, email, expected):
    response = client.post("/users/", json={
        "email": email,
        "username": "test",
        "password": "testpass"
    })
    if expected:
        assert response.status_code == 201
    else:
        assert response.status_code == 422
\`\`\`

---

## 六、最佳实践与常见坑点

### 6.1 测试最佳实践

1. **测试隔离**：每个测试独立运行，不依赖其他测试结果
2. **事务回滚**：使用事务回滚保持测试数据库干净
3. **测试覆盖**：覆盖正常路径、边界情况、错误场景
4. **Mock外部服务**：邮件、第三方API等使用Mock
5. **测试速度**：优先单元测试，集成测试控制数量
6. **测试命名**：test_功能_场景_预期结果

### 6.2 常见坑点

**坑点1：测试之间数据污染**

\`\`\`python
# 错误：测试数据在测试间共享
def test_a(db_session):
    user = User(name="test")
    db_session.add(user)
    db_session.commit()

def test_b(db_session):
    # 可能受test_a影响！
    pass

# 正确：使用事务回滚fixture，每个测试后回滚
@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()
\`\`\`

**坑点2：忘记清除dependency_overrides**

\`\`\`python
# 错误：override未清除影响其他测试
def test_something(client):
    app.dependency_overrides[get_db] = mock_db
    response = client.get("/")
    assert response.status_code == 200

# 正确：在fixture中使用yield清理
@pytest.fixture
def client_with_mock(mock_db):
    app.dependency_overrides[get_db] = lambda: mock_db
    yield TestClient(app)
    app.dependency_overrides.clear()
\`\`\`
`
  },
  {
    id: "pyb-13-7",
    group: "FastAPI进阶实战",
    icon: "🔥",
    title: "FastAPI部署",
    content: `

# FastAPI部署

## 一、Uvicorn生产配置

### 1.1 Uvicorn基础配置

\`\`\`bash
pip install uvicorn gunicorn
\`\`\`

\`\`\`python
# main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
\`\`\`

\`\`\`bash
# 开发模式
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 生产模式
uvicorn main:app \\
  --host 0.0.0.0 \\
  --port 8000 \\
  --workers 4 \\
  --loop uvloop \\
  --http httptools \\
  --proxy-headers \\
  --forwarded-allow-ips='*' \\
  --access-log \\
  --log-level info
\`\`\`

### 1.2 Uvicorn参数详解

| 参数 | 推荐值 | 说明 |
|------|--------|------|
| --workers | CPU核数*2+1 | 工作进程数 |
| --loop | uvloop | 高性能事件循环 |
| --http | httptools | 高性能HTTP解析 |
| --proxy-headers | True | 信任代理头 |
| --limit-concurrency | 100-1000 | 并发连接限制 |
| --timeout-keep-alive | 5 | Keep-Alive超时(秒) |
| --log-level | info | 日志级别 |

### 1.3 代码中启动Uvicorn

\`\`\`python
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        workers=4,
        loop="uvloop",
        http="httptools",
        proxy_headers=True,
        log_level="info"
    )
\`\`\`

---

## 二、Gunicorn+UvicornWorker

### 2.1 Gunicorn配置

\`\`\`python
# gunicorn_conf.py
import multiprocessing

bind = "0.0.0.0:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
max_requests = 10000
max_requests_jitter = 1000
timeout = 30
keepalive = 5
preload_app = True
accesslog = "-"
errorlog = "-"
loglevel = "info"

# 进程名称
proc_name = "fastapi_app"

# 优雅重启
graceful_timeout = 30
\`\`\`

### 2.2 启动命令

\`\`\`bash
# 使用配置文件启动
gunicorn main:app -c gunicorn_conf.py

# 命令行参数启动
gunicorn main:app \\
  --workers 4 \\
  --worker-class uvicorn.workers.UvicornWorker \\
  --bind 0.0.0.0:8000 \\
  --max-requests 10000 \\
  --timeout 30 \\
  --access-logfile - \\
  --error-logfile -
\`\`\`

### 2.3 Uvicorn vs Hypercorn对比

| 特性 | Uvicorn | Hypercorn |
|------|---------|-----------|
| HTTP/2支持 | 有限 | 完整支持 |
| 性能 | 极高 | 高 |
| Trio支持 | 否 | 是 |
| 稳定性 | 非常稳定 | 稳定 |
| 推荐场景 | 大多数场景 | 需要HTTP/2 |

---

## 三、Docker镜像构建

### 3.1 Dockerfile

\`\`\`dockerfile
# 多阶段构建
FROM python:3.11-slim as builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# 最终镜像
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache /wheels/*

COPY . .

RUN useradd -m appuser
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["gunicorn", "main:app", "-c", "gunicorn_conf.py"]
\`\`\`

### 3.2 docker-compose.yml

\`\`\`yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/app
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=your-secret-key-change-in-production
    depends_on:
      - db
      - redis
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '2'
          memory: 2G

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=app
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
\`\`\`

---

## 四、Nginx反向代理配置

### 4.1 Nginx配置

\`\`\`nginx
upstream fastapi_backend {
    server api:8000;
    keepalive 64;
}

server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 50M;

    # WebSocket支持
    location /ws {
        proxy_pass http://fastapi_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }

    # API请求
    location / {
        proxy_pass http://fastapi_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 启用keepalive
        proxy_set_header Connection "";

        # 缓冲设置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;

        # 超时设置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # 健康检查
    location /health {
        proxy_pass http://fastapi_backend/health;
        access_log off;
    }

    # 静态文件
    location /static {
        alias /app/static;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
\`\`\`

---

## 五、K8s部署基础

### 5.1 Deployment配置

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fastapi-app
  labels:
    app: fastapi
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fastapi
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: fastapi
    spec:
      containers:
      - name: api
        image: myapp/fastapi:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: secret-key
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 2
            memory: 2Gi
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 15
          periodSeconds: 20
\`\`\`

### 5.2 Service与Ingress

\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: fastapi-service
spec:
  selector:
    app: fastapi
  ports:
  - port: 80
    targetPort: 8000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fastapi-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "300"
spec:
  tls:
  - hosts:
    - api.example.com
    secretName: fastapi-tls
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: fastapi-service
            port:
              number: 80
\`\`\`

---

## 六、最佳实践与常见坑点

### 6.1 部署最佳实践

1. **多进程部署**：使用Gunicorn管理多个Uvicorn worker
2. **容器化**：使用Docker + docker-compose或K8s
3. **健康检查**：配置readiness/liveness探针
4. **日志收集**：输出到stdout/stderr，用ELK/Loki收集
5. **监控告警**：Prometheus + Grafana监控
6. **限流防护**：Nginx层限流，应用层业务限流
7. **优雅关闭**：处理SIGTERM信号，完成在途请求

### 6.2 健康检查端点

\`\`\`python
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import aioredis

app = FastAPI()

@app.get("/health")
async def health_check():
    """简单健康检查"""
    return {"status": "ok"}

@app.get("/health/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """就绪检查（包含依赖服务）"""
    checks = {}
    overall_status = "ok"

    # 检查数据库
    try:
        db.execute("SELECT 1")
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {str(e)}"
        overall_status = "error"

    # 检查Redis
    try:
        redis = aioredis.from_url("redis://localhost")
        await redis.ping()
        checks["redis"] = "ok"
    except Exception as e:
        checks["redis"] = f"error: {str(e)}"
        overall_status = "error"

    status_code = 200 if overall_status == "ok" else 503
    return {"status": overall_status, "checks": checks}, status_code
\`\`\`

### 6.3 常见坑点

**坑点1：workers数量设置不当**

\`\`\`python
# 错误：workers过多导致内存不足或过多上下文切换
workers = 100  # 太多！

# 正确：CPU核数 * 2 + 1 是经验值
import multiprocessing
workers = multiprocessing.cpu_count() * 2 + 1
\`\`\`

**坑点2：忘记配置proxy-headers**

在Nginx反向代理后不配置proxy-headers会导致request.client.host获取的是Nginx IP而非真实客户端IP。

\`\`\`python
# uvicorn启动必须加
uvicorn main:app --proxy-headers --forwarded-allow-ips='*'
\`\`\`
`
  },
  {
    id: "pyb-13-8",
    group: "FastAPI进阶实战",
    icon: "🔥",
    title: "FastAPI高级模式",
    content: `

# FastAPI高级模式

## 一、自定义APIRoute

### 1.1 自定义路由类

\`\`\`python
from fastapi import APIRouter, FastAPI, Request, Response
from fastapi.routing import APIRoute
import time
import logging

logger = logging.getLogger(__name__)

class TimedRoute(APIRoute):
    """记录请求耗时的路由类"""
    def get_route_handler(self):
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: Request):
            start = time.time()
            response: Response = await original_route_handler(request)
            duration = time.time() - start
            response.headers["X-Response-Time"] = str(duration)
            logger.info(
                f"{request.method} {request.url.path} "
                f"→ {response.status_code} ({duration:.3f}s)"
            )
            return response

        return custom_route_handler

class LoggedRoute(APIRoute):
    """记录请求日志的路由类"""
    def get_route_handler(self):
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: Request):
            try:
                response = await original_route_handler(request)
                return response
            except Exception as e:
                logger.error(
                    f"请求错误: {request.method} {request.url.path}",
                    exc_info=e
                )
                raise

        return custom_route_handler

# 使用自定义路由
router = APIRouter(route_class=TimedRoute)
\`\`\`

### 1.2 组合多个路由行为

\`\`\`python
from typing import Callable

class AdvancedRoute(APIRoute):
    def get_route_handler(self) -> Callable:
        original_route_handler = super().get_route_handler()

        async def advanced_handler(request: Request):
            # 请求ID
            request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))

            # 记录开始时间
            start = time.perf_counter()

            # 添加请求状态
            request.state.request_id = request_id
            request.state.start_time = start

            try:
                response: Response = await original_route_handler(request)

                # 添加响应头
                response.headers["X-Request-ID"] = request_id
                response.headers["X-Response-Time"] = str(
                    time.perf_counter() - start
                )
                return response

            except Exception as e:
                logger.exception(
                    f"请求失败 [{request_id}]: {request.method} {request.url.path}"
                )
                raise

        return advanced_handler
\`\`\`

---

## 二、请求上下文

### 2.1 使用request.state存储状态

\`\`\`python
from fastapi import Request, Depends
import uuid
from contextvars import ContextVar

# ContextVar用于在异步上下文中传递数据
request_id_var: ContextVar[str] = ContextVar("request_id")
current_user_var: ContextVar = ContextVar("current_user")

@app.middleware("http")
async def add_request_context(request: Request, call_next):
    # 生成请求ID
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id

    # 设置ContextVar
    token = request_id_var.set(request_id)
    try:
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
    finally:
        request_id_var.reset(token)

# 使用ContextVar获取请求ID
def get_request_id() -> str:
    try:
        return request_id_var.get()
    except LookupError:
        return "unknown"

# 在任何地方都可以获取请求ID
async def some_utility_function():
    req_id = get_request_id()
    logger.info(f"[{req_id}] 执行工具函数")
\`\`\`

### 2.2 请求状态中间件

\`\`\`python
from datetime import datetime

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = datetime.utcnow()
    request.state.start_time = start_time

    response = await call_next(request)

    process_time = (datetime.utcnow() - start_time).total_seconds()
    response.headers["X-Process-Time"] = str(process_time)
    return response
\`\`\`

---

## 三、异常处理exception_handler

### 3.1 全局异常处理

\`\`\`python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

logger = logging.getLogger(__name__)

app = FastAPI()

class AppException(Exception):
    """应用自定义异常基类"""
    def __init__(self, code: int, message: str, data=None):
        self.code = code
        self.message = message
        self.data = data

class BusinessError(AppException):
    """业务错误"""
    pass

class NotFoundError(AppException):
    """资源不存在"""
    pass

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=200,
        content={
            "code": exc.code,
            "message": exc.message,
            "data": exc.data,
            "request_id": getattr(request.state, "request_id", None)
        }
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.status_code,
            "message": exc.detail,
            "request_id": getattr(request.state, "request_id", None)
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "code": 422,
            "message": "参数验证错误",
            "errors": exc.errors(),
            "request_id": getattr(request.state, "request_id", None)
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"未处理异常: {request.method} {request.url.path}",
        exc_info=exc
    )
    return JSONResponse(
        status_code=500,
        content={
            "code": 500,
            "message": "服务器内部错误",
            "request_id": getattr(request.state, "request_id", None)
        }
    )
\`\`\`

### 3.2 使用自定义异常

\`\`\`python
@app.get("/users/{user_id}")
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = crud_user.get(db, user_id)
    if not user:
        raise NotFoundError(code=40401, message="用户不存在")
    return user

@app.post("/transfer")
async def transfer(data: TransferSchema):
    if data.amount <= 0:
        raise BusinessError(code=40001, message="转账金额必须大于0")
    if data.from_id == data.to_id:
        raise BusinessError(code=40002, message="不能转账给自己")
    # ...
\`\`\`

---

## 四、事件处理(startup/shutdown)

### 4.1 生命周期事件

\`\`\`python
from contextlib import asynccontextmanager
from fastapi import FastAPI

# 方式1：使用lifespan（推荐，FastAPI 0.93.0+）
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时执行
    print("应用启动中...")

    # 初始化数据库连接
    app.state.db_pool = await create_db_pool()

    # 初始化Redis
    app.state.redis = aioredis.from_url("redis://localhost")

    # 启动后台任务
    app.state.scheduler = AsyncIOScheduler()
    app.state.scheduler.start()

    yield

    # 关闭时执行
    print("应用关闭中...")

    # 关闭数据库连接
    await app.state.db_pool.close()

    # 关闭Redis
    await app.state.redis.close()

    # 停止调度器
    app.state.scheduler.shutdown()

app = FastAPI(lifespan=lifespan)

# 方式2：使用装饰器（旧方式）
@app.on_event("startup")
async def startup_event():
    app.state.redis = await init_redis()

@app.on_event("shutdown")
async def shutdown_event():
    await app.state.redis.close()
\`\`\`

### 4.2 初始化资源

\`\`\`python
async def create_db_pool():
    """创建数据库连接池"""
    return await create_async_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_recycle=3600
    )

def init_app_resources(app: FastAPI):
    """同步资源初始化"""
    app.state.config = load_config()
\`\`\`

---

## 五、State跨请求共享

### 5.1 app.state使用

\`\`\`python
from fastapi import FastAPI, Request, Depends

app = FastAPI()

# 在启动时初始化共享资源
@app.on_event("startup")
async def startup():
    app.state.settings = load_settings()
    app.state.redis = await init_redis()
    app.state.http_client = httpx.AsyncClient()

# 依赖中获取app.state
def get_redis(request: Request):
    return request.app.state.redis

def get_settings(request: Request):
    return request.app.state.settings

@app.get("/items")
async def get_items(redis=Depends(get_redis)):
    cached = await redis.get("items")
    if cached:
        return json.loads(cached)
    # ...查询数据库...

# 也可以直接在路由中访问
@app.get("/config")
async def get_config(request: Request):
    return {"debug": request.app.state.settings.DEBUG}
\`\`\`

### 5.2 全局缓存使用

\`\`\`python
from cachetools import TTLCache
import asyncio

# 在app.state中存放缓存
@app.on_event("startup")
async def startup():
    # 内存缓存：最多1000条，TTL 5分钟
    app.state.cache = TTLCache(maxsize=1000, ttl=300)
    app.state.cache_lock = asyncio.Lock()

async def get_cached_data(key: str, fetch_func, request: Request):
    cache = request.app.state.cache
    lock = request.app.state.cache_lock

    async with lock:
        if key in cache:
            return cache[key]

        data = await fetch_func()
        cache[key] = data
        return data
\`\`\`

---

## 六、自定义响应类

### 6.1 统一响应格式

\`\`\`python
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from typing import Any, Optional

class ApiResponse(JSONResponse):
    """统一API响应格式"""
    def __init__(
        self,
        data: Any = None,
        message: str = "success",
        code: int = 0,
        status_code: int = 200,
        headers: dict = None
    ):
        content = {
            "code": code,
            "message": message,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
        super().__init__(
            content=content,
            status_code=status_code,
            headers=headers
        )

class PageResponse(ApiResponse):
    """分页响应"""
    def __init__(
        self,
        items: list,
        total: int,
        page: int,
        page_size: int,
        message: str = "success"
    ):
        data = {
            "items": items,
            "pagination": {
                "total": total,
                "page": page,
                "page_size": page_size,
                "total_pages": (total + page_size - 1) // page_size
            }
        }
        super().__init__(data=data, message=message)

class ErrorResponse(ApiResponse):
    """错误响应"""
    def __init__(
        self,
        message: str,
        code: int = 500,
        errors: list = None,
        status_code: int = 400
    ):
        super().__init__(
            message=message,
            code=code,
            data={"errors": errors} if errors else None,
            status_code=status_code
        )
\`\`\`

### 6.2 使用自定义响应

\`\`\`python
@app.get("/items", response_class=ApiResponse)
async def list_items(page: int = 1, page_size: int = 20):
    items, total = get_items(page, page_size)
    return PageResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )

@app.get("/items/{item_id}")
async def get_item(item_id: int):
    item = crud_item.get(item_id)
    if not item:
        return ErrorResponse(message="项目不存在", code=40401, status_code=404)
    return ApiResponse(data=item)
\`\`\`

---

## 七、最佳实践与常见坑点

### 7.1 高级模式最佳实践

1. **自定义异常分层**：区分业务异常、系统异常、第三方异常
2. **请求ID链路追踪**：每个请求生成唯一ID，日志和响应中都包含
3. **统一响应格式**：所有接口返回统一的JSON结构
4. **资源生命周期管理**：使用lifespan管理数据库、Redis等资源
5. **中间件精简**：中间件不要写太多逻辑，保持轻量

### 7.2 常见坑点

**坑点1：在middleware中修改request不生效**

\`\`\`python
# 错误：直接修改request属性
@app.middleware("http")
async def bad_middleware(request: Request, call_next):
    request.state.user = get_user()  # 某些情况下可能不传递
    return await call_next(request)

# 正确：使用request.state或ContextVar
@app.middleware("http")
async def good_middleware(request: Request, call_next):
    request.state.user = await get_user_from_token(request)
    token = current_user_var.set(request.state.user)
    try:
        return await call_next(request)
    finally:
        current_user_var.reset(token)
\`\`\`

**坑点2：lifespan中异常导致应用无法启动**

\`\`\`python
# 错误：初始化失败没有处理，应用直接崩溃
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db = await connect_db()  # 连接失败则无法启动
    yield
    await app.state.db.close()

# 正确：优雅处理初始化失败
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        app.state.db = await connect_db()
    except Exception as e:
        logger.error(f"数据库连接失败: {e}")
        app.state.db = None
    yield
    if app.state.db:
        await app.state.db.close()
\`\`\`

**坑点3：自定义异常处理不保留原始异常信息**

生产环境不要暴露内部错误详情，但要记录日志：

\`\`\`python
@app.exception_handler(Exception)
async def generic_handler(request: Request, exc: Exception):
    # 记录完整错误栈到日志
    logger.exception(f"未处理异常: {exc}")

    # 返回用户友好信息
    return JSONResponse(
        status_code=500,
        content={"code": 500, "message": "服务器错误，请稍后重试"}
    )
\`\`\`
`
  }
]