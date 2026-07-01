// =============================================================
// FastAPI 应用开发实战 - 第十四批章节(项目结构与配置,共 4 章)
// 章节 53-56:项目分层架构 / 配置管理 / 日志与监控 / 生命周期与启动任务
// =============================================================

export const chapters = [
  // =============================================================
  // 第五十三章:项目分层架构
  // =============================================================
  {
    id: 'proj-structure',
    group: '项目结构与配置',
    icon: '🏗️',
    title: '项目分层架构',
    content: `## 第五十三章　项目分层架构

### 53.1 为什么不能全写在 main.py

教程里为了演示方便,所有代码都堆在 \`main.py\` 里。这在 demo 阶段没问题,但真实项目一旦这么做,很快就会变成噩梦:

- **文件膨胀**:一个 \`main.py\` 几千行,找个接口要滚半天;
- **协作冲突**:两个人同时改 \`main.py\`,git 合并冲突不断;
- **职责混乱**:路由、数据库、业务逻辑、校验全搅在一起,改一处怕动到另一处;
- **无法复用**:同样的业务逻辑想给别的接口用,没法 import;
- **测试困难**:逻辑全绑在路由里,想单独测业务函数测不了。

> 解决方案就一个字:**分层**。让代码各司其职,每层只做自己该做的事。

### 53.2 经典分层架构

Web 后端有个公认的分层模式,从上到下:

\`\`\`
HTTP 请求
    ↓
┌─────────────┐
│  路由层 api  │  接收请求、参数校验、调 service、组装响应
└─────────────┘
    ↓
┌─────────────┐
│ 业务层 service│  真正的业务逻辑(算钱、扣库存、发邮件)
└─────────────┘
    ↓
┌─────────────┐
│ 数据层 dao/crud│  只管增删改查,不懂业务
└─────────────┘
    ↓
┌─────────────┐
│ 模型层 models │  定义表结构(ORM)
└─────────────┘
\`\`\`

每层只依赖下一层,**绝对不能反向依赖**(业务层不该 import 路由层)。

### 53.3 为什么这么分

| 层 | 职责 | 不该做的事 |
| --- | --- | --- |
| 路由层 | 接请求、校验、调 service、返响应 | 写业务逻辑、直接操作数据库 |
| 业务层 | 核心业务规则 | 关心 HTTP 状态码、关心响应格式 |
| 数据层 | 增删改查 | 业务判断(比如"余额不足不能扣") |
| 模型层 | 表结构定义 | 业务方法(虽然 ORM 允许,但不推荐) |

> 关键原则:**业务层是项目的心脏,它不该知道"HTTP"的存在**。这样以后你想把这套业务逻辑接到 CLI、消息队列、定时任务,都能直接复用。

### 53.4 推荐目录结构

\`\`\`
my_project/
├── app/
│   ├── __init__.py
│   ├── main.py                 # 创建 FastAPI 实例、注册路由、启动入口
│   ├── core/                   # 核心配置、安全、依赖
│   │   ├── config.py           # Settings 配置类
│   │   ├── security.py         # JWT、密码哈希
│   │   └── dependencies.py    # 通用依赖(分页、当前用户)
│   ├── api/                    # 路由层
│   │   ├── __init__.py
│   │   ├── deps.py             # 路由层用的依赖(get_db、get_current_user)
│   │   └── v1/                 # API 版本
│   │       ├── __init__.py
│   │       ├── router.py       # 汇总各子路由
│   │       ├── auth.py         # /auth 路由
│   │       ├── users.py        # /users 路由
│   │       └── posts.py        # /posts 路由
│   ├── services/               # 业务逻辑层
│   │   ├── __init__.py
│   │   ├── user_service.py     # 用户相关业务
│   │   └── post_service.py     # 文章相关业务
│   ├── crud/                   # 数据层(增删改查)
│   │   ├── __init__.py
│   │   ├── base.py             # 通用 CRUD 基类
│   │   └── user.py             # 用户表 CRUD
│   ├── models/                 # 数据库模型(ORM)
│   │   ├── __init__.py
│   │   ├── base.py             # Base、引擎
│   │   └── user.py             # User 表
│   ├── schemas/                # Pydantic 数据校验
│   │   ├── __init__.py
│   │   ├── user.py             # UserCreate / UserOut / UserUpdate
│   │   └── post.py
│   └── utils/                  # 工具函数
│       └── pagination.py
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   └── test_users.py
├── .env                        # 环境变量(不进 git)
├── requirements.txt
└── pyproject.toml
\`\`\`

### 53.5 路由拆分:APIRouter

把不同模块的路由拆到不同文件,用 \`APIRouter\` 创建"子路由",再在 main.py 里注册:

\`\`\`python
# app/api/v1/users.py —— 用户路由
from fastapi import APIRouter, Depends
from app.schemas.user import UserCreate, UserOut
from app.services.user_service import UserService
from app.api.deps import get_db

router = APIRouter(prefix="/users", tags=["用户"])

@router.get("/", response_model=list[UserOut])
def list_users(db = Depends(get_db)):
    service = UserService(db)
    return service.list_users()

@router.post("/", response_model=UserOut, status_code=201)
def create_user(user_in: UserCreate, db = Depends(get_db)):
    service = UserService(db)
    return service.create_user(user_in)
\`\`\`

\`\`\`python
# app/api/v1/posts.py —— 文章路由
from fastapi import APIRouter

router = APIRouter(prefix="/posts", tags=["文章"])

@router.get("/")
def list_posts():
    return []
\`\`\`

### 53.6 汇总子路由

\`\`\`python
# app/api/v1/router.py —— 把所有子路由汇总
from fastapi import APIRouter
from app.api.v1 import users, posts

api_router = APIRouter(prefix="/v1")
api_router.include_router(users.router)    # 注册 users
api_router.include_router(posts.router)    # 注册 posts
\`\`\`

### 53.7 在 main.py 注册总路由

\`\`\`python
# app/main.py —— 应用入口
from fastapi import FastAPI
from app.api.v1.router import api_router

app = FastAPI(title="我的博客 API", version="1.0.0")

# 注册 v1 路由
app.include_router(api_router)

# 这样所有路径是 /v1/users/... /v1/posts/...
\`\`\`

**好处**:

- 路由分散在多个文件,不冲突;
- 加新模块只要新建一个文件,在 \`router.py\` 加一行 \`include_router\`;
- 以后想做 \`/v2\` 版本,直接复制 \`v1\` 目录改名,互不影响。

### 53.8 业务层 service 的写法

业务逻辑层是核心,通常封装成类(也可以是函数):

\`\`\`python
# app/services/user_service.py
from app.crud.user import UserCRUD
from app.schemas.user import UserCreate, UserOut
from app.core.security import hash_password
from fastapi import HTTPException

class UserService:
    """用户业务逻辑层。"""
    def __init__(self, db):
        self.db = db
        self.crud = UserCRUD(db)   # 数据层

    def create_user(self, user_in: UserCreate) -> UserOut:
        # 业务规则:邮箱不能重复
        if self.crud.get_by_email(user_in.email):
            raise HTTPException(400, "邮箱已存在")
        # 业务逻辑:密码哈希
        hashed = hash_password(user_in.password)
        # 调数据层写入
        return self.crud.create(email=user_in.email, hashed_password=hashed)

    def list_users(self, skip: int = 0, limit: int = 20):
        return self.crud.list(skip, limit)
\`\`\`

**为什么用类**:可以把 \`db\` 存成实例属性,方法之间不用反复传 \`db\`。

### 53.9 数据层 crud 的写法

数据层只管"怎么从数据库读写",不关心业务:

\`\`\`python
# app/crud/user.py
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate

class UserCRUD:
    def __init__(self, db: Session):
        self.db = db

    def get(self, user_id: int):
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str):
        return self.db.query(User).filter(User.email == email).first()

    def list(self, skip: int = 0, limit: int = 20):
        return self.db.query(User).offset(skip).limit(limit).all()

    def create(self, email: str, hashed_password: str):
        user = User(email=email, hashed_password=hashed_password)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
\`\`\`

### 53.10 schemas:输入输出校验分离

\`\`\`python
# app/schemas/user.py
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str        # 创建时需要密码

class UserUpdate(BaseModel):
    email: EmailStr | None = None
    password: str | None = None

class UserOut(UserBase):  # 返回给前端的,不含密码
    id: int
    class Config:
        from_attributes = True
\`\`\`

**拆分原则**:

- \`UserCreate\`:接口入参(有密码);
- \`UserOut\`:接口出参(没密码);
- \`UserUpdate\`:更新入参(都是可选);
- \`User\`(model):数据库表(有 hashed_password)。

> 这是 Pydantic 推荐的模式:**永远不要用一个 schema 兼顾入参和出参**。

### 53.11 各层依赖关系图

\`\`\`
main.py
  └─ 注册 api_router
       └─ users.router (路由层)
            └─ UserService (业务层)
                 └─ UserCRUD (数据层)
                      └─ User (模型层)
\`\`\`

**关键**:依赖只能往下,不能往上。比如 \`UserService\` 不该 \`import\` 路由层的东西,否则就乱了。

### 53.12 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 业务逻辑写在路由里 | 无法复用、难测试 | 路由只调 service |
| service 直接返回 ORM 对象 | 暴露内部字段(如密码) | service 返回 schema 对象 |
| 循环依赖(A import B,B import A) | 启动报错 | 用依赖注入解耦 |
| 一个 router 文件管所有路由 | 又回到 main.py 膨胀 | 按模块拆 router |
| 忘了 \`include_router\` | 路由 404 | 加完路由记得注册 |
| schema 入参出参共用一个 | 出参漏字段或暴露敏感数据 | Create/Out/Update 分开 |

> **本章小结**:分层架构让代码各司其职——路由接请求、service 做业务、crud 管数据、models 定义表、schemas 校验数据。FastAPI 用 \`APIRouter\` + \`include_router\` 实现路由拆分。下一章讲怎么管理配置(数据库地址、密钥这些)。`,
  },

  // =============================================================
  // 第五十四章:配置管理
  // =============================================================
  {
    id: 'proj-config',
    group: '项目结构与配置',
    icon: '⚙️',
    title: '配置管理',
    content: `## 第五十四章　配置管理

### 54.1 为什么不能硬编码

新手最容易犯的错:把数据库地址、密钥、端口直接写死在代码里:

\`\`\`python
# ❌ 烂写法
DATABASE_URL = "mysql://user:pass@localhost:3306/mydb"
SECRET_KEY = "my-super-secret"
DEBUG = True
\`\`\`

这种写法有几个致命问题:

- **环境差异**:开发用本地 MySQL、测试用 SQLite、生产用云数据库,硬编码每次部署都要改代码;
- **安全风险**:密钥、数据库密码写死在代码里,一旦代码进 git,等于公开了;
- **难维护**:改个配置要改代码、重新打包、重新部署,周期长;
- **无法区分多环境**:同一个代码库,dev/staging/prod 配置不同,硬编码做不到。

> 配置管理的核心原则:**代码和配置分离**。代码不变,配置随环境变。

### 54.2 用 pydantic-settings

FastAPI 作者推荐用 \`pydantic-settings\`(从 Pydantic v2 起独立成包):

\`\`\`bash
pip install pydantic-settings
\`\`\`

它的思路:

1. 定义一个 \`Settings\` 类,字段就是配置项;
2. 字段类型决定怎么从环境变量解析(类型安全);
3. 自动从环境变量 / \`.env\` 文件读取值。

### 54.3 第一个 Settings 类

\`\`\`python
# app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # 每个字段会自动从同名环境变量读取(大小写不敏感)
    DATABASE_URL: str = "sqlite:///./dev.db"
    SECRET_KEY: str = "change-me"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/v1"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # 配置:允许从 .env 文件读取
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

# 全局单例,其它地方 import 这个用
settings = Settings()
\`\`\`

### 54.4 .env 文件

在项目根目录建 \`.env\`(千万别进 git):

\`\`\`
# .env
DATABASE_URL=mysql://user:pass@localhost:3306/mydb
SECRET_KEY=a-very-long-random-string
DEBUG=True
ACCESS_TOKEN_EXPIRE_MINUTES=60
\`\`\`

\`Settings()\` 初始化时,会按优先级读取:

1. **环境变量**(最高,部署时用);
2. **.env 文件**(开发时用);
3. **代码里的默认值**(最低)。

### 54.5 .gitignore 必须排除 .env

\`\`\`
# .gitignore
.env
.env.*
*.env
\`\`\`

但可以提供一个 \`.env.example\` 模板进 git,告诉别人有哪些配置项:

\`\`\`
# .env.example(这个进 git)
DATABASE_URL=mysql://user:pass@localhost:3306/mydb
SECRET_KEY=请替换成随机字符串
DEBUG=False
\`\`\`

### 54.6 在代码里用 settings

\`\`\`python
# app/main.py
from fastapi import FastAPI
from app.core.config import settings

app = FastAPI(
    title="我的 API",
    debug=settings.DEBUG,           # 从配置读
)

# 路由前缀从配置读
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# 用配置生成密钥
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")
\`\`\`

### 54.7 多环境配置

不同环境用不同的 \`.env\` 文件,或者直接用环境变量覆盖:

**方式一:不同环境不同 .env 文件**

\`\`\`
.env.dev          # 开发
.env.test         # 测试
.env.prod         # 生产
\`\`\`

启动时指定:

\`\`\`bash
# 通过 ENV_FILE 环境变量切换
ENV_FILE=.env.prod uvicorn app.main:app
\`\`\`

\`\`\`python
# config.py 支持
import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./dev.db"
    SECRET_KEY: str = "change-me"
    DEBUG: bool = False

    model_config = SettingsConfigDict(
        env_file=os.getenv("ENV_FILE", ".env"),
        case_sensitive=False,
    )
\`\`\`

**方式二:部署时用环境变量覆盖(推荐,生产用)**

\`\`\`bash
# Docker / k8s 里直接设环境变量,优先级最高
export DATABASE_URL=mysql://prod-user:prod-pass@db:3306/mydb
export SECRET_KEY=prod-secret-key
export DEBUG=False
uvicorn app.main:app
\`\`\`

> 生产环境推荐方式二:**配置不落地**,直接在部署平台设环境变量,最安全。

### 54.8 配置优先级详解

\`\`\`
环境变量(最高)
    ↓ 找不到
.env 文件
    ↓ 找不到
代码里的默认值(最低)
\`\`\`

**这意味着**:

- 开发时用 \`.env\` 方便;
- 生产时设环境变量,不依赖 \`.env\` 文件;
- 默认值是"兜底",只在都没设时用。

### 54.9 敏感信息处理

| 信息类型 | 例子 | 怎么存 |
| --- | --- | --- |
| 公开配置 | API 前缀、分页大小 | 代码默认值或 .env |
| 半敏感 | 数据库 URL(含密码) | .env(不进 git) |
| 高敏感 | JWT 密钥、第三方 API key | 环境变量 / 密钥管理服务(Vault) |

**密钥生成**:

\`\`\`python
# 生成一个安全的随机密钥
import secrets
print(secrets.token_urlsafe(32))
# 输出类似:9aF3kL...xY2z(43 字符)
\`\`\`

### 54.10 嵌套配置(复杂场景)

配置项多了,可以分组:

\`\`\`python
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict

class DatabaseSettings(BaseModel):
    url: str = "sqlite:///./dev.db"
    pool_size: int = 5
    echo: bool = False

class RedisSettings(BaseModel):
    url: str = "redis://localhost:6379"
    ttl: int = 3600

class Settings(BaseSettings):
    database: DatabaseSettings = DatabaseSettings()
    redis: RedisSettings = RedisSettings()
    secret_key: str = "change-me"
    model_config = SettingsConfigDict(env_file=".env", env_nested_delimiter="__")

settings = Settings()
# 用法:settings.database.url、settings.redis.ttl
\`\`\`

\`.env\` 里这样写(用 \`__\` 表示嵌套):

\`\`\`
DATABASE__URL=mysql://localhost:3306/mydb
DATABASE__POOL_SIZE=10
REDIS__TTL=7200
\`\`\`

### 54.11 在测试里用不同配置

\`\`\`python
# tests/conftest.py
import os
# 测试前强制用测试数据库
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["DEBUG"] = "False"

# 注意:必须在 import Settings 之前设
from app.core.config import Settings
test_settings = Settings()

# 或者直接构造
def get_test_settings():
    return Settings(DATABASE_URL="sqlite:///./test.db", DEBUG=False)
\`\`\`

### 54.12 完整配置示例

\`\`\`python
# app/core/config.py
from pydantic import EmailStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """应用配置,从环境变量和 .env 读取。"""

    # 应用
    APP_NAME: str = "我的博客 API"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # 安全
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"

    # 数据库
    DATABASE_URL: str = "sqlite:///./dev.db"

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Redis(可选)
    REDIS_URL: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

settings = Settings()
\`\`\`

\`\`\`python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
)

# CORS 配置从 settings 读
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 路由前缀从 settings 读
app.include_router(api_router, prefix=settings.API_V1_PREFIX)
\`\`\`

### 54.13 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| \`.env\` 进了 git | 密钥泄露 | \`.gitignore\` 排除,只提交 \`.env.example\` |
| 密钥用默认值上生产 | 被人伪造 token | 生产必须设环境变量覆盖 |
| 在函数里反复 \`Settings()\` | 每次重新解析 .env,慢 | 全局单例 \`settings = Settings()\` |
| 布尔配置写成 \`"false"\` 字符串 | 被当成 True(非空字符串) | 用 \`bool\` 类型,pydantic 自动转 |
| \`.env\` 改了不重启 | 配置没生效 | Settings 只在启动时读,改 .env 要重启 |
| 嵌套配置漏了 \`env_nested_delimiter\` | 嵌套字段读不到 | 设 \`__\` 分隔符 |

> **本章小结**:用 \`pydantic-settings\` 把配置变成类型安全的 \`Settings\` 类,从 \`.env\` 和环境变量读取,代码和配置分离。优先级:环境变量 > .env > 默认值。敏感信息绝不进 git。下一章讲日志,出问题时靠它定位。`,
  },

  // =============================================================
  // 第五十五章:日志与监控
  // =============================================================
  {
    id: 'proj-logging',
    group: '项目结构与配置',
    icon: '📝',
    title: '日志与监控',
    content: `## 第五十五章　日志与监控

### 55.1 为什么用 logging 不用 print

新手最爱用 \`print\` 调试,但在生产环境它有几个硬伤:

| 问题 | print | logging |
| --- | --- | --- |
| 级别 | 没有,全是"信息" | 有 DEBUG/INFO/WARNING/ERROR |
| 格式 | 纯文本,没时间没位置 | 可定制(时间、模块、行号) |
| 输出目标 | 只能控制台 | 文件、网络、邮件都能发 |
| 动态控制 | 要么全打要么全不打 | 配置级别,生产只打 ERROR |
| 性能 | 频繁 print 拖慢 | 可关闭,几乎零开销 |
| 结构化 | 纯文本 | 可输出 JSON,便于采集 |

> 一句话:**print 是给人看的,logging 是给系统看的**。生产环境出了问题,你只能靠日志回溯,print 那点信息根本不够。

### 55.2 Python logging 模块

Python 自带 \`logging\` 模块,核心概念:

- **Logger**:日志记录器,你调 \`logger.info()\` 那个对象;
- **Handler**:日志往哪输出(控制台、文件);
- **Formatter**:日志长什么样;
- **Level**:日志级别。

\`\`\`python
import logging

# 1. 配置
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler()],
)

logger = logging.getLogger(__name__)

# 2. 用
logger.debug("调试信息,默认不输出")
logger.info("普通信息")
logger.warning("警告")
logger.error("错误")
\`\`\`

### 55.3 日志级别

| 级别 | 数值 | 用途 |
| --- | --- | --- |
| \`DEBUG\` | 10 | 调试细节,生产关掉 |
| \`INFO\` | 20 | 关键流程节点(用户登录、订单创建) |
| \`WARNING\` | 30 | 异常但可处理(降级、重试) |
| \`ERROR\` | 40 | 出错了,但服务还能跑 |
| \`CRITICAL\` | 50 | 严重错误,服务要挂 |

**经验**:

- DEBUG 太多别上生产;
- INFO 只记关键节点,别啥都 INFO(记每次循环就刷屏了);
- ERROR 是"需要人介入"的,记了不处理就是埋雷。

### 55.4 在 FastAPI 里用 logging

\`\`\`python
# app/core/logging.py
import logging
import sys

def setup_logging():
    """统一配置日志。"""
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # 控制台输出
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    # 文件输出(追加模式)
    file_handler = logging.FileHandler("app.log", encoding="utf-8")
    file_handler.setFormatter(formatter)

    # 配置根 logger
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    root.addHandler(console_handler)
    root.addHandler(file_handler)
\`\`\`

\`\`\`python
# app/main.py
from fastapi import FastAPI
from app.core.logging import setup_logging

setup_logging()   # 启动时配置一次

app = FastAPI()

import logging
logger = logging.getLogger(__name__)

@app.get("/")
def root():
    logger.info("访问了根路径")
    return {"msg": "hello"}
\`\`\`

### 55.5 请求日志中间件

每个请求都记日志,出问题能追溯:

\`\`\`python
import time
import logging
from fastapi import Request

logger = logging.getLogger("app.request")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """记录每个请求的方法、路径、耗时。"""
    start = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start) * 1000

    logger.info(
        f"{request.method} {request.url.path} "
        f"-> {response.status_code} ({duration_ms:.1f}ms)"
    )

    # 慢请求单独标记
    if duration_ms > 1000:
        logger.warning(f"慢请求: {request.url.path} 耗时 {duration_ms:.0f}ms")

    return response
\`\`\`

### 55.6 第三方库 loguru(更易用)

Python 自带 \`logging\` 配置繁琐,很多人用 \`loguru\`:

\`\`\`bash
pip install loguru
\`\`\`

\`\`\`python
from loguru import logger

# 开箱即用,不用配置
logger.info("启动应用")
logger.warning("配置缺失,用默认值")
logger.error("数据库连接失败")

# 自动带颜色、时间、模块、行号
# 还能直接写文件
logger.add("app.log", rotation="10 MB", retention="7 days", level="INFO")

# 捕获异常堆栈
try:
    1 / 0
except Exception:
    logger.exception("计算出错")   # 自动打印完整堆栈
\`\`\`

> \`loguru\` 的 \`logger.exception\` 比 \`logging\` 的 \`logger.error(..., exc_info=True)\` 直观得多,而且配置一行搞定。

### 55.7 结构化日志(JSON)

传统日志是文本,日志采集系统(ELK、Loki)更喜欢 JSON 格式,方便检索:

\`\`\`python
import json
import logging

class JsonFormatter(logging.Formatter):
    """把日志格式化成 JSON。"""
    def format(self, record):
        log_data = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "line": record.lineno,
        }
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_data, ensure_ascii=False)

# 用
handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logging.basicConfig(level=logging.INFO, handlers=[handler])

logger = logging.getLogger("app")
logger.info("用户登录", extra={"user_id": 123, "ip": "1.2.3.4"})
\`\`\`

输出:

\`\`\`json
{"timestamp": "2026-07-01 10:00:00", "level": "INFO", "logger": "app", "message": "用户登录", "module": "auth", "line": 42}
\`\`\`

> 这样在 ELK 里搜 \`level:ERROR AND user_id:123\` 就能精准定位。

### 55.8 不记敏感信息

日志是给运维看的,但别把密码、token、身份证号记进去:

\`\`\`python
# ❌ 危险
logger.info(f"用户登录,密码是 {password}")

# ✅ 安全
logger.info("用户登录", extra={"user_id": user.id})

# 主动脱敏
def mask(s: str) -> str:
    if len(s) <= 4:
        return "***"
    return s[:2] + "***" + s[-2:]

logger.info(f"手机号: {mask(phone)}")
\`\`\`

### 55.9 Sentry 错误监控

日志是被动看,Sentry 是主动推——出了 ERROR 自动报警到你邮箱/钉钉。

\`\`\`bash
pip install sentry-sdk
\`\`\`

\`\`\`python
# app/main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="https://xxx@sentry.io/123",   # 从 Sentry 后台拿
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1,            # 10% 请求追踪性能
    environment="production",
)

# 之后任何未捕获的异常,Sentry 都会收到
\`\`\`

> 配合日志:\`logging\` 记日常信息,Sentry 兜底异常告警。

### 55.10 完整配置示例

\`\`\`python
# app/core/logging.py
import logging
import logging.config
import sys

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "stream": sys.stdout,
            "formatter": "default",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "logs/app.log",
            "maxBytes": 10 * 1024 * 1024,   # 10MB
            "backupCount": 7,               # 保留 7 个旧文件
            "encoding": "utf-8",
            "formatter": "default",
        },
    },
    "loggers": {
        "app": {"level": "INFO", "handlers": ["console", "file"], "propagate": False},
        "uvicorn": {"level": "INFO"},
    },
    "root": {"level": "WARNING", "handlers": ["console"]},
}

def setup_logging():
    logging.config.dictConfig(LOGGING_CONFIG)
\`\`\`

\`\`\`python
# app/main.py
from fastapi import FastAPI
from app.core.logging import setup_logging

setup_logging()

app = FastAPI()
\`\`\`

### 55.11 日志级别选择对照

| 场景 | 用什么级别 |
| --- | --- |
| 用户登录成功 | INFO |
| 接口请求完成 | INFO(或 DEBUG,看量) |
| 配置缺失,用默认值 | WARNING |
| 第三方 API 重试中 | WARNING |
| 数据库连接失败 | ERROR |
| 业务逻辑异常(余额不足) | INFO(不是 ERROR,这是正常业务) |
| 未捕获异常 | ERROR + Sentry |
| 服务要挂了 | CRITICAL |

### 55.12 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 用 \`print\` 调试 | 生产看不到 | 用 \`logger.debug\` |
| INFO 记太多 | 日志爆炸,有用信息被淹 | INFO 只记关键节点 |
| 日志里记密码 | 安全事故 | 脱敏处理 |
| 日志不设大小上限 | 磁盘写满,服务挂 | \`RotatingFileHandler\` 滚动 |
| 异常没 \`exc_info\` | 看不到堆栈 | \`logger.exception\` 或 \`exc_info=True\` |
| 多进程写同一文件 | 日志错乱 | 用 \`ConcurrentLogHandler\` 或 loguru |

> **本章小结**:用 \`logging\`(或 \`loguru\`)替代 \`print\`,按级别输出,生产只留 INFO 以上。请求日志中间件记录每个请求,结构化日志(JSON)方便采集。Sentry 兜底异常告警。下一章讲应用启动和关闭时该做什么。`,
  },

  // =============================================================
  // 第五十六章:生命周期与启动任务
  // =============================================================
  {
    id: 'proj-lifespan',
    group: '项目结构与配置',
    icon: '🔄',
    title: '生命周期与启动任务',
    content: `## 第五十六章　生命周期与启动任务

### 56.1 什么是生命周期

应用启动时要做一些"初始化",关闭时要做一些"清理",这些就是生命周期事件:

- **启动时**:连数据库、建连接池、加载 ML 模型、预热缓存;
- **关闭时**:关连接池、释放资源、刷盘日志。

> 类比:开店前要"开门、开灯、准备收银机",打烊要"关门、关灯、收钱入保险箱"。这就是商店的"生命周期"。

### 56.2 旧方式:on_event(已不推荐)

早期 FastAPI 用 \`@app.on_event\`:

\`\`\`python
@app.on_event("startup")
async def startup():
    print("启动了")

@app.on_event("shutdown")
async def shutdown():
    print("关闭了")
\`\`\`

这种方式有几个问题:

- **状态共享麻烦**:startup 里建的连接,shutdown 里要怎么拿到?要靠全局变量;
- **不支持异步资源**:无法用 \`async with\` 管理异步资源;
- **FastAPI 官方已不推荐**:在文档里明确说"建议改用 lifespan"。

### 56.3 新方式:lifespan(推荐)

用 \`lifespan\` 上下文管理器,把"启动"和"关闭"写在一起:

\`\`\`python
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时执行(yield 之前)
    print("应用启动")
    # ... 这里建连接池、加载模型
    yield
    # 关闭时执行(yield 之后)
    print("应用关闭")
    # ... 这里关连接池、释放资源

app = FastAPI(lifespan=lifespan)
\`\`\`

**关键**:\`yield\` 把函数分成两半——前面是 startup,后面是 shutdown。中间状态可以用 \`yield\` 的返回值传递(用 \`yield value\`,但 FastAPI 里通常用全局状态)。

### 56.4 为什么用 lifespan 不用 on_event

| 维度 | on_event | lifespan |
| --- | --- | --- |
| 状态共享 | 靠全局变量,丑陋 | 在一个作用域里,清晰 |
| 异步资源 | 不支持 \`async with\` | 原生支持 |
| 代码组织 | startup 和 shutdown 分两处 | 写在一起,逻辑连贯 |
| 官方态度 | 不推荐 | 推荐 |
| 资源清理 | 容易漏 | \`yield\` 后自动执行 |

> 经验:新项目一律用 \`lifespan\`,老项目迁移可以慢慢改。

### 56.5 启动时建数据库连接池

\`\`\`python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

# 全局变量存连接池(也可以用 app.state)
engine = None
AsyncSession = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global engine, AsyncSession
    # 启动:建连接池
    engine = create_async_engine(
        "mysql+aiomysql://user:pass@localhost:3306/mydb",
        pool_size=10,
        max_overflow=20,
        pool_recycle=3600,   # 连接每小时回收
    )
    AsyncSession = async_sessionmaker(engine, expire_on_commit=False)
    print("数据库连接池已建立")

    yield   # 应用运行期间

    # 关闭:释放连接池
    await engine.dispose()
    print("数据库连接池已关闭")

app = FastAPI(lifespan=lifespan)
\`\`\`

### 56.6 启动时加载 ML 模型

机器学习模型加载很慢(几秒到几十秒),不能每次请求都加载,要在启动时加载一次:

\`\`\`python
from contextlib import asynccontextmanager
from fastapi import FastAPI

# 全局变量存模型
ml_model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global ml_model
    # 启动:加载模型(只加载一次)
    print("开始加载模型...")
    from transformers import pipeline
    ml_model = pipeline("sentiment-analysis")
    print("模型加载完成")
    # 把模型挂到 app.state,路由里能拿到
    app.state.model = ml_model

    yield

    # 关闭:释放模型显存
    del ml_model
    print("模型已释放")

app = FastAPI(lifespan=lifespan)

@app.get("/predict")
def predict(text: str):
    # 从 app.state 拿模型
    model = app.state.model
    return model(text)
\`\`\`

> 关键:**模型只加载一次,所有请求复用同一个模型实例**。如果每次请求都加载,接口要等几秒,根本没法用。

### 56.7 启动时预热缓存

\`\`\`python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动:把热门数据从数据库加载到 Redis
    import redis.asyncio as redis
    redis_client = redis.from_url("redis://localhost:6379")
    app.state.redis = redis_client

    # 预热:把首页文章列表缓存
    hot_posts = await fetch_hot_posts_from_db()
    await redis_client.set("hot_posts", json.dumps(hot_posts))
    print("缓存预热完成")

    yield

    # 关闭:关 Redis 连接
    await redis_client.close()
\`\`\`

### 56.8 用 app.state 传递状态

\`app.state\` 是 FastAPI 提供的全局状态对象,推荐用它存启动时创建的资源:

\`\`\`python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时创建资源,挂到 app.state
    app.state.db_pool = create_db_pool()
    app.state.redis = create_redis()
    app.state.model = load_model()

    yield

    # 关闭时清理
    await app.state.db_pool.close()
    await app.state.redis.close()
    del app.state.model

# 路由里通过 request.app.state 拿
from fastapi import Request

@app.get("/")
async def root(request: Request):
    redis = request.app.state.redis
    return {"cached": await redis.get("foo")}
\`\`\`

> 比全局变量更优雅,因为状态和 app 绑定,测试时换个 app 就换个状态。

### 56.9 多个启动任务的顺序

\`lifespan\` 里按代码顺序执行,需要按依赖顺序排:

\`\`\`python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. 先建数据库连接(其它任务可能依赖它)
    app.state.db = create_db_pool()
    # 2. 再建 Redis(预热缓存需要它)
    app.state.redis = create_redis()
    # 3. 加载模型(独立任务)
    app.state.model = load_model()
    # 4. 预热缓存(依赖 db + redis)
    await warmup_cache(app.state.db, app.state.redis)

    yield

    # 关闭顺序反过来:先关依赖方,再关被依赖方
    del app.state.model
    await app.state.redis.close()
    await app.state.db.close()
\`\`\`

> 经验:**启动顺序是"先底层后上层",关闭顺序反过来"先上层后底层"**。和盖楼拆楼一个道理。

### 56.10 异步资源用 async with

如果资源本身是 \`async with\` 兼容的,可以直接嵌套:

\`\`\`python
import asyncpg
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # async with 自动在退出时关连接
    async with asyncpg.create_pool(dsn="...") as pool:
        app.state.db = pool
        yield
    # 退出 async with 自动关 pool
\`\`\`

多个 \`async with\` 嵌套,推荐用 \`contextlib.AsyncExitStack\`:

\`\`\`python
from contextlib import asynccontextmanager, AsyncExitStack

@asynccontextmanager
async def lifespan(app: FastContext):
    async with AsyncExitStack() as stack:
        db = await stack.enter_async_context(open_db())
        redis = await stack.enter_async_context(open_redis())
        app.state.db = db
        app.state.redis = redis
        yield
    # 退出时自动按相反顺序关 redis、db
\`\`\`

### 56.11 完整示例

\`\`\`python
# app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
import redis.asyncio as redis

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期:启动建资源,关闭释放。"""
    # ===== 启动阶段 =====
    print(">>> 应用启动中...")

    # 1. 建 Redis 连接池
    app.state.redis = redis.from_url(
        "redis://localhost:6379",
        max_connections=20,
    )
    await app.state.redis.ping()
    print("   Redis 连接 OK")

    # 2. 加载配置(模拟)
    app.state.config = {"version": "1.0.0"}

    print(">>> 应用启动完成")

    yield   # ===== 应用运行期间 =====

    # ===== 关闭阶段 =====
    print(">>> 应用关闭中...")
    await app.state.redis.close()
    print(">>> 应用已关闭")

app = FastAPI(lifespan=lifespan)

@app.get("/")
async def root(request: Request):
    # 从 app.state 拿启动时建的 redis
    redis_client = request.app.state.redis
    await redis_client.incr("visit_count")
    count = await redis_client.get("visit_count")
    return {"visit_count": int(count), "version": request.app.state.config["version"]}
\`\`\`

### 56.12 lifespan vs on_event 对照

| 维度 | on_event | lifespan |
| --- | --- | --- |
| 写法 | 两个装饰器 | 一个上下文管理器 |
| 状态共享 | 全局变量 | 作用域内 / app.state |
| 异步资源 | 不支持 async with | 原生支持 |
| 启动关闭关系 | 分离,容易漏清理 | 写在一起,逻辑连贯 |
| 官方推荐 | 否 | 是 |
| 迁移成本 | - | 低,改写法即可 |

### 56.13 易错点小结

| 易错点 | 后果 | 正确做法 |
| --- | --- | --- |
| 启动建了资源,关闭忘了释放 | 资源泄漏(连接、显存) | lifespan 里 yield 后必须清理 |
| 启动任务抛异常 | 应用起不来 | 启动任务加 try/except,或让失败 |
| 用 \`on_event\` 新项目 | 不推荐,且状态难管 | 用 \`lifespan\` |
| 多 worker 下模型加载多次 | 内存浪费 / 加载慢 | \`preload_app=True\` 让 worker 复制 |
| 全局变量没加 \`global\` | 修改不生效 | 用 \`app.state\` 替代全局变量 |
| 关闭顺序和启动一样 | 被依赖的资源先关,出错 | 关闭顺序反过来 |

> **本章小结**:用 \`lifespan\`(替代 \`on_event\`)管理应用生命周期——启动时建连接池、加载模型、预热缓存,关闭时按相反顺序释放。资源挂到 \`app.state\`,路由里通过 \`request.app.state\` 拿。配置和项目结构这批到此结束,下一批进入部署与运维。`,
  },
];
