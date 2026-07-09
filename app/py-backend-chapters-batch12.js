// =============================================================
// Python后端面试指南 - 第12批章节（FastAPI核心 8章）
// =============================================================

export const chapters = [
  {
    id: "pyb-12-1",
    group: "FastAPI核心",
    icon: "⚡",
    title: "FastAPI框架概述",
    content: `# FastAPI框架概述

## 一、FastAPI特性

FastAPI是一个现代、高性能的Python Web框架，用于构建API。

### 核心特性

| 特性 | 说明 |
|------|------|
| 高性能 | 基于Starlette和Pydantic，性能接近NodeJS和Go |
| 快速开发 | 开发效率提升约200%-300% |
| 自动文档 | 自动生成Swagger UI和ReDoc文档 |
| 类型提示 | 基于Python类型提示，IDE友好 |
| 异步支持 | 原生async/await支持 |
| 数据验证 | 基于Pydantic，自动类型转换和验证 |
| 依赖注入 | 内置强大的依赖注入系统 |
| 标准兼容 | 基于OpenAPI和JSON Schema标准 |

### 性能对比

| 框架 | 性能(QPS) | 类型提示 | 自动文档 | 异步支持 |
|------|----------|---------|---------|---------|
| FastAPI | ~30000 | ✅ | ✅ | ✅ |
| Flask | ~15000 | ⚠️ | ❌ | ⚠️ |
| Django | ~12000 | ⚠️ | ❌ | ⚠️ |
| Starlette | ~35000 | ⚠️ | ❌ | ✅ |
| Node.js(Express) | ~32000 | ⚠️ | ❌ | ✅ |
| Go(Gin) | ~50000 | ✅ | ❌ | ✅ |

注：性能数据为参考值，实际取决于具体场景

## 二、基于Starlette + Pydantic

FastAPI建立在两个优秀的库之上：

### Starlette
Starlette是一个轻量级ASGI框架，提供：
- **路由系统**：高性能URL路由匹配
- **中间件**：请求/响应中间件支持
- **WebSocket**：原生WebSocket支持
- **后台任务**：异步后台任务
- **静态文件**：静态文件服务
- **测试客户端**：基于httpx的测试客户端
- **CORS**：跨域资源共享
- **会话**：Cookie会话支持

### Pydantic
Pydantic是数据验证库，提供：
- **类型注解**：基于Python类型提示
- **数据验证**：自动验证数据类型和约束
- **数据转换**：自动类型转换（如字符串转整数）
- **JSON Schema**：自动生成JSON Schema
- **嵌套模型**：支持复杂的嵌套数据结构
- **ORM模式**：可以直接从ORM对象读取

\`\`\`python
# Pydantic示例
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import List, Optional

class User(BaseModel):
    id: int
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., regex=r'^[\\w.-]+@[\\w.-]+\\.\\w+$')
    age: Optional[int] = Field(None, ge=0, le=150)
    signup_date: datetime = Field(default_factory=datetime.now)
    tags: List[str] = []

    @validator('username')
    def username_alphanumeric(cls, v):
        if not v.isalnum():
            raise ValueError('用户名只能包含字母和数字')
        return v

# 使用
user = User(id=1, username='john', email='john@example.com', age=25)
print(user.dict())  # 转为字典
print(user.json())  # 转为JSON
\`\`\`

## 三、适用场景

| 场景 | FastAPI是否适合 | 说明 |
|------|---------------|------|
| RESTful API | ✅ 非常适合 | 自动文档、类型验证、高性能 |
| 微服务 | ✅ 非常适合 | 轻量、高性能、启动快 |
| 机器学习后端 | ✅ 非常适合 | 与Python数据科学生态完美结合 |
| 异步服务 | ✅ 非常适合 | 原生async/await支持 |
| 实时WebSocket | ✅ 非常适合 | Starlette原生支持 |
| 传统全栈网站 | ⚠️ 可以使用 | 需要配合Jinja2等模板引擎 |
| 大型单体应用 | ⚠️ 可以使用 | 需要自己组织项目结构 |
| 高并发API | ✅ 非常适合 | 异步+高性能 |

## 四、Hello World

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="我的API", version="1.0.0")

class Item(BaseModel):
    name: str
    price: float
    is_offer: Optional[bool] = None

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Optional[str] = None):
    return {"item_id": item_id, "q": q}

@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item):
    return {"item_name": item.name, "item_id": item_id, "item": item}

# 运行：uvicorn main:app --reload
# 文档：http://127.0.0.1:8000/docs  (Swagger UI)
#       http://127.0.0.1:8000/redoc (ReDoc)
\`\`\`

## 五、FastAPI vs Flask vs Django

| 维度 | FastAPI | Flask | Django |
|------|---------|-------|--------|
| 类型提示 | ✅ 一等公民支持 | ⚠️ 需扩展 | ⚠️ 部分支持 |
| 自动文档 | ✅ 内置Swagger/ReDoc | ❌ 需要扩展 | ❌ 需要第三方 |
| 数据验证 | ✅ Pydantic自动验证 | ❌ 需手动或用WTForms | ✅ Forms验证 |
| 异步支持 | ✅ 原生async/await | ⚠️ 2.0+有限支持 | ⚠️ 3.0+有限支持 |
| 性能 | ⚡ 非常高 | 🐢 中等 | 🐢 中等 |
| 学习曲线 | 平缓（熟悉类型提示） | 非常平缓 | 较陡 |
| ORM | 可自由选择 | 可自由选择（SQLAlchemy） | ✅ 内置ORM |
| Admin后台 | ❌ 需要扩展 | ❌ 需要Flask-Admin | ✅ 内置 |
| 电池内置 | ❌ 微框架+扩展 | ❌ 微框架+扩展 | ✅ 全栈内置 |
| 适合API | ✅ 专为API设计 | ⚠️ 适合但非专为 | ⚠️ DRF可用 |
| 社区生态 | 快速增长中 | 非常成熟 | 非常成熟 |

## 六、最佳实践

1. **充分利用类型提示**：这是FastAPI的核心优势，不要浪费
2. **使用Pydantic模型**：所有请求/响应都定义模型，获得自动验证和文档
3. **合理组织项目结构**：按功能模块拆分，使用APIRouter
4. **善用依赖注入**：复用通用逻辑（认证、数据库连接等）
5. **使用异步但不滥用**：IO密集型用async，CPU密集型可以用普通函数
6. **配置好CORS**：前后端分离项目必须配置
7. **启用自动文档**：生产环境可以考虑关闭或加认证
8. **使用Pydantic的Field**：添加详细的字段描述和验证规则

## 七、常见坑点

\`\`\`python
# 坑1：函数定义成async但里面用同步阻塞代码
# 错误：async def里使用time.sleep()会阻塞整个事件循环
import time
@app.get("/bad")
async def bad_endpoint():
    time.sleep(5)  # ❌ 阻塞！
    return {"message": "Done"}

# 正确1：用普通def，FastAPI会放到线程池
@app.get("/good1")
def good_endpoint():
    time.sleep(5)  # ✅ 在线程池中运行
    return {"message": "Done"}

# 正确2：真正的异步代码用async
import asyncio
@app.get("/good2")
async def good_endpoint():
    await asyncio.sleep(5)  # ✅ 异步等待
    return {"message": "Done"}

# 坑2：Pydantic模型和ORM模型混淆
# Pydantic模型用于API请求/响应，不要直接继承SQLAlchemy模型
# 正确做法：分开定义，或使用orm_mode
class UserDB(SQLAlchemyBase):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String)
    password_hash = Column(String)

class UserResponse(BaseModel):
    id: int
    username: str
    class Config:
        orm_mode = True  # 可以从ORM对象读取

# 坑3：忘记启动服务器用uvicorn
# FastAPI是ASGI应用，不能用Flask那种app.run()
# 正确：uvicorn main:app --reload
\`\`\``
  },
  {
    id: "pyb-12-2",
    group: "FastAPI核心",
    icon: "⚡",
    title: "FastAPI快速开始",
    content: `# FastAPI快速开始

## 一、安装与Hello World

### 安装

\`\`\`bash
pip install fastapi
pip install "uvicorn[standard]"  # ASGI服务器

# 或者全部安装
pip install "fastapi[all]"
\`\`\`

### Hello World

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
\`\`\`

### 运行服务器

\`\`\`bash
# 基本启动
uvicorn main:app

# 指定主机端口
uvicorn main:app --host 0.0.0.0 --port 8000

# 开发模式（自动重载）
uvicorn main:app --reload

# 多worker（生产）
uvicorn main:app --workers 4
\`\`\`

### 自动文档

启动后访问：
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc
- OpenAPI JSON: http://127.0.0.1:8000/openapi.json

## 二、路径操作装饰器

FastAPI支持所有标准HTTP方法：

| 装饰器 | 方法 | 用途 |
|--------|------|------|
| @app.get() | GET | 获取资源 |
| @app.post() | POST | 创建资源 |
| @app.put() | PUT | 整体更新资源 |
| @app.patch() | PATCH | 部分更新资源 |
| @app.delete() | DELETE | 删除资源 |
| @app.options() | OPTIONS | 获取通信选项 |
| @app.head() | HEAD | 类似GET但无响应体 |
| @app.trace() | TRACE | 追踪路径 |

\`\`\`python
from fastapi import FastAPI
app = FastAPI()

# 路径参数
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}

# POST创建
@app.post("/items/")
async def create_item(item: dict):
    return {"item": item}

# PUT更新
@app.put("/items/{item_id}")
async def update_item(item_id: int, item: dict):
    return {"item_id": item_id, "item": item}

# DELETE删除
@app.delete("/items/{item_id}")
async def delete_item(item_id: int):
    return {"deleted": item_id}
\`\`\`

### 路径参数和查询参数

\`\`\`python
from fastapi import FastAPI
from typing import Optional

app = FastAPI()

# 路径参数：在URL路径中
@app.get("/users/{user_id}/items/{item_id}")
async def read_user_item(
    user_id: int,           # 路径参数，必需
    item_id: str,           # 路径参数，必需
    q: Optional[str] = None,  # 查询参数，可选
    short: bool = False     # 查询参数，布尔类型
):
    item = {"item_id": item_id, "owner_id": user_id}
    if q:
        item.update({"q": q})
    if not short:
        item.update({"description": "这是一个很棒的商品"})
    return item

# 访问示例：
# /users/123/items/abc?q=search&short=true
\`\`\`

## 三、参数校验(Q/P/Path)

FastAPI提供Query、Path、Body等类用于参数校验和元数据。

### Query查询参数校验

\`\`\`python
from fastapi import FastAPI, Query
from typing import Optional, List

app = FastAPI()

@app.get("/items/")
async def read_items(
    # 必填查询参数，最小3字符，最大50字符
    q: str = Query(..., min_length=3, max_length=50, title="搜索关键词", description="用于搜索的关键词"),
    # 可选查询参数，默认10，范围1-100
    page: int = Query(1, ge=1, le=100, description="页码"),
    # 可选查询参数，默认20
    per_page: int = Query(20, ge=1, le=100, alias="per-page"),
    # 列表查询参数 ?tags=python&tags=fastapi
    tags: List[str] = Query([], description="标签列表"),
):
    results = {"items": [{"item_id": "Foo"}, {"item_id": "Bar"}]}
    if q:
        results.update({"q": q})
    return results

# 参数说明：
# ... 表示必填参数
# min_length/max_length: 字符串长度限制
# ge/le/gt/lt: 数值大小限制 (>=, <=, >, <)
# regex: 正则表达式匹配
# title/description: 文档描述
# alias: URL中的参数别名
# deprecated: 标记为弃用
\`\`\`

### Path路径参数校验

\`\`\`python
from fastapi import FastAPI, Path, Query

app = FastAPI()

@app.get("/items/{item_id}")
async def read_item(
    # 路径参数，必须>=1，标题和描述用于文档
    item_id: int = Path(..., title="商品ID", description="要获取的商品ID", ge=1),
    # 查询参数
    q: Optional[str] = Query(None, alias="item-query"),
):
    return {"item_id": item_id}

# 注意：路径参数是必需的，因为必须在URL路径中
\`\`\`

### 参数顺序问题

当需要同时声明路径参数和查询参数，且查询参数在路径参数前面时，可以用*来分隔：

\`\`\`python
from fastapi import FastAPI, Path, Query

app = FastAPI()

@app.get("/items/{item_id}")
async def read_items(
    *,  # 后面的参数都作为关键字参数
    item_id: int = Path(..., ge=1),
    q: str = Query(..., min_length=3),
    size: float = Query(..., gt=0, lt=10.5)
):
    return {"item_id": item_id, "q": q}
\`\`\`

### 数值校验

| 参数 | 含义 | 示例 |
|------|------|------|
| gt | greater than > | gt=0 必须大于0 |
| ge | greater than or equal >= | ge=1 必须>=1 |
| lt | less than < | lt=100 必须小于100 |
| le | less than or equal <= | le=100 必须<=100 |
| min_length | 字符串最小长度 | min_length=3 |
| max_length | 字符串最大长度 | max_length=50 |
| regex | 正则匹配 | regex=r'^\\d+$' |

\`\`\`python
from fastapi import FastAPI, Query
app = FastAPI()

@app.get("/items/{item_id}")
async def read_item(
    item_id: int = Path(..., ge=1, le=1000),
    name: str = Query(..., min_length=3, max_length=50, regex=r"^[a-zA-Z0-9_-]+$"),
    price: float = Query(..., gt=0, lt=100000),
):
    return {"item_id": item_id, "name": name, "price": price}
\`\`\`

## 四、多路径和查询参数示例

\`\`\`python
from fastapi import FastAPI, Path, Query
from typing import Optional

app = FastAPI()

# 用户API示例
@app.get("/users/{user_id}")
async def get_user(
    user_id: int = Path(..., ge=1, description="用户ID"),
    include_posts: bool = Query(False, description="是否包含文章"),
    post_limit: int = Query(10, ge=1, le=100, description="文章数量限制"),
):
    user = {"id": user_id, "name": "John"}
    if include_posts:
        user["posts"] = []  # 获取用户文章
    return user

# 文件路径参数
@app.get("/files/{file_path:path}")
async def read_file(file_path: str):
    return {"file_path": file_path}
# 匹配: /files/docs/index.html, /files/a/b/c.txt
\`\`\`

## 五、最佳实践

1. **显式声明参数类型**：充分利用类型提示，获得自动验证和文档
2. **添加description**：为API参数添加描述，方便前端开发者
3. **合理使用参数约束**：min_length、ge等约束保证数据合法性
4. **路径参数用Path()**：即使不需要校验，也显式用Path()声明
5. **查询参数设置合理默认值**：可选参数一定要有默认值
6. **使用alias处理特殊参数名**：如per-page这种带横杠的
7. **布尔查询参数简洁**：short=true或short=false即可
8. **列表参数用List[str]**：接收重复的查询参数

## 六、常见坑点

\`\`\`python
# 坑1：忘记参数是路径参数还是查询参数
# {item_id}在路径中 → 路径参数，必需
# q: Optional[str] = None → 查询参数，可选
@app.get("/items/{item_id}")
async def read_item(item_id: int, q: Optional[str] = None):
    pass

# 坑2：布尔参数不需要传true/false
# 这些都可以：?short=1, ?short=true, ?short=True, ?short=on, ?short=yes
# 不传或其他值为False

# 坑3：路径参数顺序问题
# Python报错：非默认参数不能在默认参数后面
# 解决：用*，或调整参数顺序
@app.get("/items/{item_id}")
async def read_items(
    *,
    item_id: int = Path(..., ge=1),
    q: str = "default",  # 有默认值
):
    pass

# 坑4：alias参数忘记用别名
# 定义了alias="per-page"，必须传?per-page=20而不是?per_page=20
@app.get("/items/")
async def read_items(per_page: int = Query(20, alias="per-page")):
    pass

# 坑5：路径参数包含斜杠用:path转换器
@app.get("/files/{file_path:path}")
async def read_file(file_path: str):
    pass
\`\`\``
  },
  {
    id: "pyb-12-3",
    group: "FastAPI核心",
    icon: "⚡",
    title: "Pydantic数据模型",
    content: `# Pydantic数据模型

## 一、BaseModel基础

Pydantic是FastAPI的数据验证核心。所有请求体和响应体都通过BaseModel定义。

\`\`\`python
from pydantic import BaseModel, Field, validator, root_validator
from datetime import datetime, date
from typing import Optional, List, Dict, Union, Enum
from enum import Enum as PythonEnum

# 基础模型
class UserBase(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None

# 创建用户模型（继承基础模型，添加密码字段）
class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)

# 用户响应模型（不返回密码）
class UserResponse(UserBase):
    id: int
    is_active: bool = True
    created_at: datetime

    class Config:
        orm_mode = True  # 可以从ORM对象读取
\`\`\`

### 模型常用方法

\`\`\`python
user = UserCreate(
    username="john",
    email="john@example.com",
    password="secret123",
    full_name="John Doe"
)

# 模型方法
user.dict()                 # 转为字典
user.json()                 # 转为JSON字符串
user.dict(by_alias=True)    # 使用别名
user.dict(exclude_unset=True)  # 只包含设置过的字段
user.dict(exclude={'password'})  # 排除某些字段
user.dict(include={'username', 'email'})  # 只包含某些字段
user.copy()                 # 复制模型
user.schema()               # 生成JSON Schema
\`\`\`

## 二、字段类型

### 基础类型

| Python类型 | 对应JSON类型 | 说明 |
|-----------|-------------|------|
| int | integer | 整数 |
| float | number | 浮点数 |
| str | string | 字符串 |
| bool | boolean | 布尔值 |
| bytes | string | Base64编码字符串 |
| datetime | string (ISO格式) | 日期时间 |
| date | string (ISO格式) | 日期 |
| time | string (ISO格式) | 时间 |
| timedelta | number (秒) | 时间差 |
| Decimal | number | 高精度小数 |
| UUID | string | UUID字符串 |
| None | null | 空值 |

\`\`\`python
from pydantic import BaseModel
from datetime import datetime, date, time, timedelta
from uuid import UUID
from decimal import Decimal

class AllTypes(BaseModel):
    int_field: int
    float_field: float
    str_field: str
    bool_field: bool
    bytes_field: bytes
    datetime_field: datetime
    date_field: date
    time_field: time
    timedelta_field: timedelta
    uuid_field: UUID
    decimal_field: Decimal
\`\`\`

### 嵌套模型

\`\`\`python
from pydantic import BaseModel
from typing import List, Dict, Set, Tuple

class Image(BaseModel):
    url: str
    name: str

class Item(BaseModel):
    name: str
    price: float
    # 单个嵌套模型
    image: Optional[Image] = None
    # 列表嵌套
    tags: List[str] = []
    # 字典（值为嵌套模型）
    images: Dict[str, Image] = {}
    # 集合
    unique_tags: Set[str] = set()
\`\`\`

### Union类型

\`\`\`python
from pydantic import BaseModel
from typing import Union, List

class Cat(BaseModel):
    pet_type: str = "cat"
    meow: str

class Dog(BaseModel):
    pet_type: str = "dog"
    bark: str

# 可以是Cat或Dog
class PetOwner(BaseModel):
    pet: Union[Cat, Dog]
    pets: List[Union[Cat, Dog]]
\`\`\`

### Enum枚举

\`\`\`python
from enum import Enum
from pydantic import BaseModel

class UserRole(str, Enum):
    ADMIN = "admin"
    MODERATOR = "moderator"
    USER = "user"
    GUEST = "guest"

class UserStatus(int, Enum):
    ACTIVE = 1
    INACTIVE = 0
    BANNED = -1

class User(BaseModel):
    username: str
    role: UserRole = UserRole.USER
    status: UserStatus = UserStatus.ACTIVE

# 使用
user = User(username="john", role=UserRole.ADMIN)
# 或传字符串值
user = User(username="john", role="admin")
\`\`\`

### 特殊类型

\`\`\`python
from pydantic import BaseModel, EmailStr, HttpUrl, IPvAnyAddress, constr, conint, confloat
from typing import Optional

class SpecialTypes(BaseModel):
    # 邮箱（需要email-validator库）
    email: EmailStr
    # URL
    website: HttpUrl
    # IP地址
    ip_address: IPvAnyAddress
    # 约束字符串
    username: constr(min_length=3, max_length=50, regex=r"^[a-zA-Z0-9_-]+$")
    # 约束整数
    age: conint(ge=0, le=150)
    # 约束浮点数
    price: confloat(gt=0)
    # 约束列表
    tags: List[constr(min_length=2, max_length=20)] = []
\`\`\`

## 三、字段验证Field

Field用于添加字段的额外验证和元数据。

\`\`\`python
from pydantic import BaseModel, Field
from typing import Optional

class Item(BaseModel):
    # 必填字段，最小2字符，最大100字符
    name: str = Field(
        ...,
        title="商品名称",
        description="商品的显示名称",
        min_length=2,
        max_length=100,
        example="iPhone 15"
    )
    # 必填字段，大于0
    price: float = Field(..., gt=0, description="商品价格", example=5999.00)
    # 可选字段，默认0，范围0-1000
    stock: int = Field(0, ge=0, le=1000, description="库存数量")
    # 可选字段，别名
    category_id: Optional[int] = Field(None, alias="categoryId")
    # 弃用字段
    old_field: Optional[str] = Field(None, deprecated=True)

    class Config:
        schema_extra = {
            "example": {
                "name": "iPhone 15",
                "price": 5999.00,
                "stock": 100
            }
        }
\`\`\`

### validator装饰器

自定义验证器：

\`\`\`python
from pydantic import BaseModel, validator, ValidationError
from typing import List

class User(BaseModel):
    username: str
    password: str
    password2: str
    email: str

    # 单个字段验证器
    @validator('username')
    def username_alphanumeric(cls, v):
        if not v.isalnum():
            raise ValueError('用户名只能包含字母和数字')
        if len(v) < 3 or len(v) > 20:
            raise ValueError('用户名长度必须在3-20之间')
        return v.lower()  # 可以转换值

    # 多个字段验证器
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('密码至少8位')
        if not any(c.isdigit() for c in v):
            raise ValueError('密码必须包含数字')
        if not any(c.isupper() for c in v):
            raise ValueError('密码必须包含大写字母')
        return v

    # 依赖其他字段的验证器
    @validator('password2')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('两次密码不一致')
        return v

    # always=True：即使没传该字段也运行
    @validator('email', always=True)
    def email_valid(cls, v):
        if '@' not in v:
            raise ValueError('邮箱格式不正确')
        return v.lower()

# 使用
try:
    user = User(
        username="John123",
        password="Secret123",
        password2="Secret123",
        email="JOHN@EXAMPLE.COM"
    )
except ValidationError as e:
    print(e.json())
\`\`\`

### root_validator根验证器

验证整个模型：

\`\`\`python
from pydantic import BaseModel, root_validator

class Order(BaseModel):
    price: float
    quantity: int
    discount: float = 0
    total: float = 0

    @root_validator
    def calculate_total(cls, values):
        price = values.get('price', 0)
        quantity = values.get('quantity', 0)
        discount = values.get('discount', 0)
        values['total'] = price * quantity * (1 - discount)
        return values

    @root_validator(pre=True)
    def check_discount(cls, values):
        # pre=True：在字段验证之前运行
        discount = values.get('discount', 0)
        if discount < 0 or discount >= 1:
            raise ValueError('折扣必须在0-1之间')
        return values
\`\`\`

## 四、JSON Schema自动生成

FastAPI根据Pydantic模型自动生成JSON Schema，用于API文档。

\`\`\`python
from pydantic import BaseModel, Field
from typing import Optional

class Item(BaseModel):
    """商品模型"""
    id: int = Field(..., description="商品ID")
    name: str = Field(..., title="名称", max_length=100)
    price: float = Field(..., gt=0, description="商品价格")
    description: Optional[str] = Field(None, description="商品描述")

# 生成JSON Schema
print(Item.schema())
# {
#   "title": "Item",
#   "description": "商品模型",
#   "type": "object",
#   "properties": {
#     "id": {"title": "Id", "description": "商品ID", "type": "integer"},
#     ...
#   },
#   "required": ["id", "name", "price"]
# }
\`\`\`

## 五、最佳实践

1. **模型按用途分层**：Base/Create/Update/Response分开定义
2. **充分利用Field验证**：min_length、ge等，在入口处就拦截非法数据
3. **编写validator复用验证逻辑**：如密码强度、邮箱格式等
4. **使用orm_mode**：方便从SQLAlchemy等ORM对象转换
5. **添加description和example**：让自动文档更清晰
6. **合理使用Optional**：标记哪些字段可以为空
7. **嵌套模型不要过深**：一般不超过3层嵌套
8. **复用模型**：通过继承减少重复代码

## 六、常见坑点

\`\`\`python
# 坑1：可变默认值问题
# 错误：默认值是可变对象，所有实例会共享
class BadModel(BaseModel):
    tags: List[str] = []  # ❌ 危险！

# 正确：用Field(default_factory=...)
from pydantic import Field
class GoodModel(BaseModel):
    tags: List[str] = Field(default_factory=list)  # ✅

# 坑2：循环引用
# 用ForwardRef或字符串引用
class Node(BaseModel):
    name: str
    children: List['Node'] = []  # 用字符串引用

Node.update_forward_refs()

# 坑3：orm_mode不会自动转换嵌套关系
class UserResponse(BaseModel):
    id: int
    posts: List['PostResponse'] = []
    class Config:
        orm_mode = True

# 需要确保posts关系也正确加载

# 坑4：验证器中访问其他字段时注意检查是否存在
@validator('password2')
def passwords_match(cls, v, values):
    # values可能没有'password'（如果password验证失败）
    if 'password' in values and v != values['password']:
        raise ValueError('密码不一致')
    return v

# 坑5：datetime格式问题
# Pydantic接收多种格式：ISO 8601、时间戳等
# 但输出总是ISO格式
\`\`\``
  },
  {
    id: "pyb-12-4",
    group: "FastAPI核心",
    icon: "⚡",
    title: "请求体与表单",
    content: `# 请求体与表单

## 一、Body参数

FastAPI使用Pydantic模型声明请求体。

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    tax: Optional[float] = None

# POST请求体
@app.post("/items/")
async def create_item(item: Item):
    item_dict = item.dict()
    if item.tax:
        price_with_tax = item.price + item.tax
        item_dict.update({"price_with_tax": price_with_tax})
    return item_dict

# 请求体+路径参数+查询参数混合
@app.put("/items/{item_id}")
async def update_item(
    item_id: int,           # 路径参数
    item: Item,             # 请求体
    q: Optional[str] = None  # 查询参数
):
    return {"item_id": item_id, **item.dict(), "q": q}
\`\`\`

### 多个Body参数

\`\`\`python
from fastapi import FastAPI, Body
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

class User(BaseModel):
    username: str
    email: str

# 多个请求体参数，会被包装成嵌套对象
@app.put("/items/{item_id}")
async def update_item(
    item_id: int,
    item: Item,
    user: User,
    importance: int = Body(..., gt=0)
):
    # 请求体格式：
    # {
    #   "item": {"name": "Foo", "price": 10.0},
    #   "user": {"username": "john", "email": "john@example.com"},
    #   "importance": 5
    # }
    return {"item_id": item_id, "item": item, "user": user, "importance": importance}

# 单值body参数用Body(..., embed=True)包装
@app.post("/items/single")
async def create_single(name: str = Body(..., embed=True)):
    # 请求体: {"name": "Foo"} 而不是直接"Foo"
    return {"name": name}
\`\`\`

### Body的额外校验

\`\`\`python
from fastapi import FastAPI, Body
from pydantic import BaseModel, Field
from typing import Optional

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

# 使用Body添加额外校验和元数据
@app.put("/items/{item_id}")
async def update_item(
    item_id: int,
    item: Item = Body(
        ...,
        example={
            "name": "Foo",
            "price": 10.0,
            "description": "A very nice Item"
        },
        description="商品信息"
    )
):
    return {"item_id": item_id, "item": item}

# 嵌入单个body参数
@app.post("/items/")
async def create_item(
    item: Item = Body(..., embed=True)
):
    # 请求体必须是 {"item": {...}}
    return item
\`\`\`

## 二、表单数据Form

接收application/x-www-form-urlencoded格式的表单数据（传统HTML表单）。

\`\`\`python
from fastapi import FastAPI, Form
from typing import Optional

app = FastAPI()

@app.post("/login/")
async def login(
    username: str = Form(...),
    password: str = Form(...),
    remember: bool = Form(False),
    next: Optional[str] = Form(None)
):
    return {"username": username, "remember": remember}

# 注意：需要安装python-multipart
# pip install python-multipart
\`\`\`

### OAuth2密码模式表单

\`\`\`python
from fastapi import FastAPI, Form, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

app = FastAPI()

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # OAuth2PasswordRequestForm包含：
    # - username: str
    # - password: str
    # - grant_type: str = None (通常"password")
    # - scope: str = "" (空格分隔的scope列表)
    # - client_id: str = None
    # - client_secret: str = None
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_token(user)
    return {"access_token": token, "token_type": "bearer"}
\`\`\`

## 三、文件上传File/UploadFile

\`\`\`python
from fastapi import FastAPI, File, UploadFile, HTTPException
from typing import List
import os
import shutil
from pathlib import Path

app = FastAPI()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# 单文件上传（小文件）
@app.post("/upload/small")
async def upload_small_file(file: bytes = File(...)):
    # 整个文件读入内存，只适合小文件
    return {"file_size": len(file)}

# 单文件上传（推荐，UploadFile）
@app.post("/upload/file")
async def upload_file(file: UploadFile = File(...)):
    # UploadFile优点：
    # - 文件存储在内存中（大文件会自动存磁盘）
    # - 有文件元数据（filename, content_type）
    # - 类文件对象，可以async读/写
    file_location = UPLOAD_DIR / file.filename
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "saved_to": str(file_location)
    }

# UploadFile属性和方法
async def demo_uploadfile(file: UploadFile):
    filename = file.filename           # 文件名
    content_type = file.content_type   # MIME类型
    file_obj = file.file               # 类文件对象（SpooledTemporaryFile）

    # 异步方法
    content = await file.read()       # 读取内容
    await file.write(b"data")         # 写入
    await file.seek(0)                # 移动指针
    await file.close()                # 关闭

# 多文件上传
@app.post("/upload/multiple")
async def upload_multiple_files(files: List[UploadFile] = File(...)):
    results = []
    for file in files:
        file_location = UPLOAD_DIR / file.filename
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        results.append({
            "filename": file.filename,
            "content_type": file.content_type
        })
    return {"uploaded": len(results), "files": results}

# 带额外参数的文件上传
@app.post("/upload/with-metadata")
async def upload_with_metadata(
    file: UploadFile = File(...),
    description: str = Form(...),
    category: str = Form(...)
):
    return {
        "filename": file.filename,
        "description": description,
        "category": category
    }
\`\`\`

### 文件上传限制

\`\`\`python
from fastapi import FastAPI, File, UploadFile, HTTPException
from typing import Optional

app = FastAPI()

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "pdf"}
MAX_SIZE = 10 * 1024 * 1024  # 10MB

@app.post("/upload/avatar")
async def upload_avatar(file: UploadFile = File(...)):
    # 检查文件扩展名
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"不支持的文件类型，允许: {ALLOWED_EXTENSIONS}")

    # 检查文件大小（读取内容检查）
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(400, f"文件大小不能超过{MAX_SIZE // 1024 // 1024}MB")

    # 检查Content-Type
    allowed_types = ["image/png", "image/jpeg", "image/gif", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(400, "文件类型不正确")

    # 保存文件...
    return {"filename": file.filename, "size": len(content)}
\`\`\`

## 四、多参数混合(Body+Query+Path)

FastAPI可以智能识别多种参数：

\`\`\`python
from fastapi import FastAPI, Body, Path, Query, File, Form, UploadFile
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float
    description: Optional[str] = None

# 多种参数混合
@app.post("/items/{item_id}")
async def create_or_update_item(
    # 路径参数
    item_id: int = Path(..., ge=1, description="商品ID"),
    # 查询参数
    q: Optional[str] = Query(None, max_length=50),
    # Body模型参数
    item: Item = Body(...),
    # 额外Body字段
    importance: int = Body(..., ge=1, le=5),
):
    return {
        "item_id": item_id,
        "q": q,
        "item": item,
        "importance": importance
    }

# 文件+表单混合（不能同时用Body模型和Form）
@app.post("/items/{item_id}/attachment")
async def upload_attachment(
    item_id: int = Path(...),
    file: UploadFile = File(...),
    description: str = Form(...),
    tags: str = Form(""),
):
    return {
        "item_id": item_id,
        "filename": file.filename,
        "description": description,
        "tags": tags.split(",") if tags else []
    }
\`\`\`

### 参数识别规则

FastAPI按照以下规则识别参数类型：

| 参数来源 | 识别方式 |
|---------|---------|
| 路径参数 | URL路径中{xxx}匹配 |
| 查询参数 | 函数参数且非Pydantic模型，非Body/Form/File |
| 请求体(JSON) | Pydantic模型参数 或 使用Body() |
| 表单数据 | 使用Form() |
| 文件上传 | 使用File()/UploadFile |

## 五、请求示例配置

在Pydantic模型中配置示例：

\`\`\`python
from fastapi import FastAPI, Body
from pydantic import BaseModel, Field
from typing import Optional

app = FastAPI()

class Item(BaseModel):
    name: str = Field(..., example="iPhone 15")
    price: float = Field(..., example=5999.00)
    description: Optional[str] = Field(None, example="最新款iPhone")

    class Config:
        schema_extra = {
            "example": {
                "name": "iPhone 15",
                "price": 5999.00,
                "description": "最新款iPhone"
            }
        }

# 或者在Body()中配置
@app.put("/items/{item_id}")
async def update_item(
    item_id: int,
    item: Item = Body(
        ...,
        examples={
            "normal": {
                "summary": "普通商品",
                "description": "一个普通商品的示例",
                "value": {
                    "name": "iPhone 15",
                    "price": 5999.00
                }
            },
            "premium": {
                "summary": "高端商品",
                "value": {
                    "name": "MacBook Pro",
                    "price": 14999.00,
                    "description": "专业笔记本"
                }
            }
        }
    )
):
    return {"item_id": item_id, "item": item}
\`\`\`

## 六、最佳实践

1. **JSON请求体用Pydantic模型**：获得自动验证和文档
2. **传统表单用Form()**：如登录表单、第三方回调
3. **文件上传用UploadFile**：不要用bytes处理大文件
4. **限制上传文件大小和类型**：防止恶意上传
5. **多参数混合时注意顺序**：路径参数在前，其他在后
6. **提供example示例**：让自动文档更友好
7. **敏感字段不要回显**：如密码不要在响应中返回
8. **文件上传后校验**：扩展名、Content-Type、文件头都要检查

## 七、常见坑点

\`\`\`python
# 坑1：Form和Body不能同时使用
# 因为Form数据编码是application/x-www-form-urlencoded，
# Body JSON是application/json，不能同时存在于一个请求
# 错误示例：
@app.post("/bad")
async def bad_endpoint(
    item: Item,           # Body JSON
    username: str = Form(...)  # ❌ 不能同时用
):
    pass

# 解决：要么都用Form，要么都用JSON Body

# 坑2：忘记安装python-multipart
# pip install python-multipart 否则Form/File无法工作

# 坑3：文件保存路径安全问题
# 用户可能上传路径遍历文件名如 ../../etc/passwd
from werkzeug.utils import secure_filename
import uuid

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    # 错误：直接用file.filename
    # with open(f"uploads/{file.filename}", "wb") as f: ...

    # 正确：安全处理文件名
    filename = secure_filename(file.filename)
    # 或者重命名为UUID
    ext = filename.rsplit(".", 1)[-1] if "." in filename else ""
    safe_filename = f"{uuid.uuid4()}.{ext}"
    with open(f"uploads/{safe_filename}", "wb") as f:
        # ...
        pass

# 坑4：await file.read()后无法再次读取
# 文件指针移动到末尾了，需要await file.seek(0)
content = await file.read()
await file.seek(0)  # 重置指针
content_again = await file.read()
\`\`\``
  },
  {
    id: "pyb-12-5",
    group: "FastAPI核心",
    icon: "⚡",
    title: "响应处理",
    content: `# 响应处理

## 一、response_model响应模型

使用response_model指定响应的数据结构，自动过滤和转换数据。

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel, EmailStr
from typing import Optional, List

app = FastAPI()

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str  # 创建时需要密码

class UserResponse(UserBase):
    id: int
    is_active: bool = True
    # 注意：不包含password！

    class Config:
        orm_mode = True

class UserDB(UserBase):
    id: int
    hashed_password: str  # 数据库存储的是哈希密码

# 使用response_model
@app.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate):
    # 接收UserCreate（含密码），返回UserResponse（不含密码）
    fake_hashed_password = user.password + "hashed"
    user_in_db = UserDB(
        id=1,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=fake_hashed_password
    )
    return user_in_db  # 自动转换为UserResponse，密码字段被过滤

# 列表响应
@app.get("/users/", response_model=List[UserResponse])
async def list_users():
    return [
        {"id": 1, "username": "john", "email": "john@example.com", "hashed_password": "secret"},
        {"id": 2, "username": "jane", "email": "jane@example.com", "hashed_password": "secret"},
    ]
\`\`\`

## 二、response_model_exclude/include

精确控制返回字段：

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    tax: Optional[float] = None
    internal_code: str = "secret"  # 内部字段

# response_model_exclude_unset: 只返回显式设置的字段
@app.get("/items/{item_id}", response_model=Item, response_model_exclude_unset=True)
async def read_item(item_id: int):
    return {"name": "Foo", "price": 10.0}
    # 只返回name和price，不返回description、tax、internal_code

# response_model_exclude: 排除指定字段
@app.get("/items/public/{item_id}", response_model=Item, response_model_exclude={"internal_code", "tax"})
async def read_item_public(item_id: int):
    return Item(name="Foo", price=10.0, internal_code="secret", tax=1.0)
    # 排除internal_code和tax

# response_model_include: 只包含指定字段
@app.get("/items/brief/{item_id}", response_model=Item, response_model_include={"name", "price"})
async def read_item_brief(item_id: int):
    return Item(name="Foo", price=10.0, description="...")
    # 只返回name和price

# response_model_exclude_defaults: 排除默认值
@app.get("/items/defaults/{item_id}", response_model=Item, response_model_exclude_defaults=True)
async def read_item_defaults(item_id: int):
    return {"name": "Foo", "price": 10.0, "description": None}
    # description是None（默认值）会被排除
\`\`\`

## 三、状态码status_code

\`\`\`python
from fastapi import FastAPI, status
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

# 直接指定状态码数字
@app.post("/items/", status_code=201)
async def create_item(item: Item):
    return item

# 使用status常量（推荐，语义清晰）
@app.post("/items2/", status_code=status.HTTP_201_CREATED)
async def create_item2(item: Item):
    return item

# 常用状态码：
# 200 - HTTP_200_OK - 成功（默认GET）
# 201 - HTTP_201_CREATED - 创建成功（POST）
# 204 - HTTP_204_NO_CONTENT - 删除成功，无返回内容
# 301/302 - 重定向
# 400 - HTTP_400_BAD_REQUEST - 请求错误
# 401 - HTTP_401_UNAUTHORIZED - 未认证
# 403 - HTTP_403_FORBIDDEN - 无权限
# 404 - HTTP_404_NOT_FOUND - 资源不存在
# 500 - HTTP_500_INTERNAL_SERVER_ERROR - 服务器错误

# 动态状态码
from fastapi import Response

@app.delete("/items/{item_id}")
async def delete_item(item_id: int, response: Response):
    item = find_item(item_id)
    if item:
        delete_item_from_db(item_id)
        response.status_code = status.HTTP_204_NO_CONTENT
        return None
    else:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"error": "Item not found"}
\`\`\`

## 四、各种响应类型

FastAPI提供多种响应类：

### JSONResponse（默认）

\`\`\`python
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/items/{item_id}")
async def get_item(item_id: int):
    if item_id == 0:
        return JSONResponse(
            status_code=404,
            content={"error": "Item not found"}
        )
    return {"id": item_id, "name": "Foo"}  # 默认JSONResponse
\`\`\`

### HTMLResponse

\`\`\`python
from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.get("/", response_class=HTMLResponse)
async def index():
    return """
    <html>
        <head><title>My Page</title></head>
        <body>
            <h1>Hello World</h1>
        </body>
    </html>
    """

# 配合模板引擎（Jinja2）
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request

templates = Jinja2Templates(directory="templates")

@app.get("/items/{item_id}", response_class=HTMLResponse)
async def read_item(request: Request, item_id: int):
    return templates.TemplateResponse(
        "item.html",
        {"request": request, "item_id": item_id}
    )
\`\`\`

### RedirectResponse

\`\`\`python
from fastapi import FastAPI
from fastapi.responses import RedirectResponse

app = FastAPI()

@app.get("/redirect")
async def redirect():
    # 临时重定向（307）
    return RedirectResponse(url="/new-url")

    # 永久重定向（301）
    return RedirectResponse(url="/new-url", status_code=301)

# 简写方式
from fastapi import redirect

@app.get("/old-page")
async def old_page():
    return redirect("/new-page")
\`\`\`

### FileResponse文件响应

\`\`\`python
from fastapi import FastAPI
from fastapi.responses import FileResponse
import os

app = FastAPI()

# 文件下载
@app.get("/download/{filename}")
async def download_file(filename: str):
    filepath = f"files/{filename}"
    if not os.path.exists(filepath):
        return JSONResponse(status_code=404, content={"error": "File not found"})
    return FileResponse(
        path=filepath,
        filename=filename,  # 下载的文件名
        media_type="application/octet-stream"  # 强制下载
    )

# 文件预览（如图片）
@app.get("/images/{filename}")
async def get_image(filename: str):
    return FileResponse(
        path=f"images/{filename}",
        media_type="image/jpeg"  # 浏览器预览
    )
\`\`\`

### StreamingResponse流式响应

\`\`\`python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import io
import time
import asyncio

app = FastAPI()

# 流式下载大文件
async def generate_large_file():
    for i in range(1000):
        yield f"Line {i}\\n".encode()
        await asyncio.sleep(0.01)

@app.get("/stream")
async def stream_file():
    return StreamingResponse(
        generate_large_file(),
        media_type="text/plain",
        headers={"Content-Disposition": "attachment; filename=large.txt"}
    )

# 返回内存中的文件
@app.get("/in-memory")
async def in_memory_file():
    buffer = io.BytesIO()
    buffer.write(b"Hello from memory")
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="text/plain",
        headers={"Content-Disposition": "attachment; filename=test.txt"}
    )
\`\`\`

### PlainTextResponse

\`\`\`python
from fastapi import FastAPI
from fastapi.responses import PlainTextResponse

app = FastAPI()

@app.get("/robots.txt", response_class=PlainTextResponse)
async def robots():
    return "User-agent: *\\nDisallow: /admin/"
\`\`\`

### ORJSONResponse（更快的JSON）

\`\`\`python
from fastapi import FastAPI
from fastapi.responses import ORJSONResponse

app = FastAPI(default_response_class=ORJSONResponse)  # 全局使用
# 或单独使用

@app.get("/fast-json")
async def fast_json():
    return ORJSONResponse({"data": "..."})

# 需要安装orjson: pip install orjson
\`\`\`

## 五、响应头和Cookie

\`\`\`python
from fastapi import FastAPI, Response
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta

app = FastAPI()

# 通过Response参数设置响应头
@app.get("/headers")
async def with_headers(response: Response):
    response.headers["X-Custom-Header"] = "custom-value"
    response.headers["X-Request-ID"] = "abc123"
    return {"message": "Headers set"}

# 设置Cookie
@app.get("/set-cookie")
async def set_cookie(response: Response):
    response.set_cookie(
        key="session_id",
        value="abc123xyz",
        max_age=3600 * 24 * 7,  # 7天，秒
        expires=datetime.utcnow() + timedelta(days=7),
        path="/",
        domain=None,
        secure=True,      # 仅HTTPS
        httponly=True,    # 禁止JS访问
        samesite="lax"    # SameSite策略
    )
    return {"message": "Cookie set"}

# 删除Cookie
@app.get("/delete-cookie")
async def delete_cookie(response: Response):
    response.delete_cookie(key="session_id")
    return {"message": "Cookie deleted"}

# 直接构造Response设置头
@app.get("/custom-response")
async def custom_response():
    content = {"message": "Hello"}
    headers = {"X-Custom": "value", "X-Powered-By": "FastAPI"}
    return JSONResponse(content=content, headers=headers, status_code=200)
\`\`\`

## 六、最佳实践

1. **定义response_model**：保证响应格式稳定，自动过滤敏感字段
2. **使用status常量**：from fastapi import status，语义清晰
3. **POST返回201**：创建资源成功返回201 Created
4. **DELETE返回204**：删除成功不需要返回内容
5. **不要返回密码等敏感字段**：用response_model过滤
6. **大文件用StreamingResponse**：避免占用过多内存
7. **Cookie设置httponly和secure**：提高安全性
8. **统一响应格式**：考虑使用统一的响应结构（code/message/data）

### 统一响应格式示例

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Generic, TypeVar, Optional, Any

app = FastAPI()

T = TypeVar("T")

class ApiResponse(BaseModel, Generic[T]):
    code: int = 0
    message: str = "success"
    data: Optional[T] = None

def success(data: Any = None, message: str = "success"):
    return ApiResponse(code=0, message=message, data=data)

def error(code: int = -1, message: str = "error"):
    return ApiResponse(code=code, message=message, data=None)

@app.get("/users/{user_id}", response_model=ApiResponse[dict])
async def get_user(user_id: int):
    user = {"id": user_id, "name": "John"}
    return success(user)

@app.get("/error-example")
async def error_example():
    return error(message="Something went wrong")
\`\`\`

## 七、常见坑点

\`\`\`python
# 坑1：response_model不生效
# 必须导入正确的类型，使用类作为response_model
@app.get("/items/", response_model=ItemResponse)  # ✅
async def get_items():
    pass

# 坑2：返回字典字段比response_model多没关系
# response_model会自动过滤不在模型中的字段
class UserResponse(BaseModel):
    id: int
    name: str

@app.get("/user", response_model=UserResponse)
async def get_user():
    return {"id": 1, "name": "John", "password": "secret", "extra": "data"}
# password和extra会被自动过滤

# 坑3：orm_mode需要配置
class UserResponse(BaseModel):
    id: int
    name: str
    class Config:
        orm_mode = True  # 必须配置，否则无法直接返回ORM对象

# 坑4：204响应不能返回内容
from fastapi import status
@app.delete("/items/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(id: int):
    return None  # ✅ 正确
    # return {"message": "deleted"}  # ❌ 204不应该有body

# 坑5：RedirectResponse默认307，POST重定向可能有问题
# 如果需要302/303，显式指定status_code
return RedirectResponse(url="/new-url", status_code=303)
\`\`\``
  },
  {
    id: "pyb-12-6",
    group: "FastAPI核心",
    icon: "⚡",
    title: "路由管理",
    content: `# 路由管理

## 一、APIRouter路由拆分

当项目变大时，使用APIRouter将路由按模块拆分。

\`\`\`python
# routers/users.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter(
    prefix="/users",
    tags=["用户管理"],
    responses={404: {"description": "Not found"}},
)

class User(BaseModel):
    id: int
    username: str
    email: str

fake_users = [
    {"id": 1, "username": "john", "email": "john@example.com"},
    {"id": 2, "username": "jane", "email": "jane@example.com"},
]

@router.get("/", response_model=List[User], summary="获取用户列表")
async def list_users():
    """获取所有用户列表"""
    return fake_users

@router.get("/{user_id}", response_model=User, summary="获取用户详情")
async def get_user(user_id: int):
    """根据用户ID获取用户详情"""
    for user in fake_users:
        if user["id"] == user_id:
            return user
    raise HTTPException(status_code=404, detail="用户不存在")

@router.post("/", response_model=User, status_code=201, summary="创建用户")
async def create_user(user: User):
    """创建新用户"""
    fake_users.append(user.dict())
    return user
\`\`\`

\`\`\`python
# routers/items.py
from fastapi import APIRouter

router = APIRouter(
    prefix="/items",
    tags=["商品管理"],
)

@router.get("/")
async def list_items():
    return [{"id": 1, "name": "Item 1"}]

@router.get("/{item_id}")
async def get_item(item_id: int):
    return {"id": item_id, "name": f"Item {item_id}"}
\`\`\`

### 注册路由到主应用

\`\`\`python
# main.py
from fastapi import FastAPI
from .routers import users, items

app = FastAPI(title="My API")

# 注册路由
app.include_router(users.router)
app.include_router(items.router)

# 也可以在注册时添加prefix、tags等
app.include_router(
    admin.router,
    prefix="/admin",
    tags=["管理后台"],
    dependencies=[Depends(get_admin_user)],  # 整个路由组添加依赖
    responses={418: {"description": "I'm a teapot"}},
)
\`\`\`

## 二、tags分组

tags用于在文档中分组显示API。

\`\`\`python
from fastapi import FastAPI, APIRouter

app = FastAPI()

# 方式1：在APIRouter上指定
user_router = APIRouter(prefix="/users", tags=["用户管理"])
item_router = APIRouter(prefix="/items", tags=["商品管理"])

# 方式2：在路由装饰器上单独指定
@app.get("/login", tags=["认证"])
async def login():
    pass

# 方式3：带描述的tags（更详细的文档分组）
tags_metadata = [
    {
        "name": "用户管理",
        "description": "用户注册、登录、信息管理等操作。",
    },
    {
        "name": "商品管理",
        "description": "商品的增删改查。",
        "externalDocs": {
            "description": "商品管理文档",
            "url": "https://example.com/docs/items/",
        },
    },
    {
        "name": "认证",
        "description": "用户认证和授权。",
    },
]

app = FastAPI(
    title="My API",
    description="完整API文档",
    version="1.0.0",
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url="/redoc",
)
\`\`\`

## 三、prefix前缀

\`\`\`python
from fastapi import APIRouter

# 方式1：创建router时指定prefix
router = APIRouter(prefix="/api/v1/users")

@router.get("/")  # 实际路径: /api/v1/users/
async def list_users():
    pass

@router.get("/{user_id}")  # 实际路径: /api/v1/users/{user_id}
async def get_user(user_id: int):
    pass

# 方式2：include_router时指定prefix
router = APIRouter(tags=["users"])
# ... 定义路由
app.include_router(router, prefix="/api/v1/users")
\`\`\`

## 四、dependencies依赖

为整个路由组添加依赖：

\`\`\`python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    user = decode_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

async def get_admin_user(current_user = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# 整个router都需要认证
protected_router = APIRouter(
    dependencies=[Depends(get_current_user)],
    prefix="/api",
)

# admin子路由需要管理员权限
admin_router = APIRouter(
    prefix="/admin",
    dependencies=[Depends(get_admin_user)],
    tags=["管理后台"],
)

@admin_router.get("/stats")
async def get_stats():
    return {"users": 100, "items": 200}
\`\`\`

## 五、include_router组织大型项目

### 推荐项目结构

\`\`\`
myapp/
├── main.py              # 主入口，include_router
├── dependencies.py      # 公共依赖
├── config.py            # 配置
├── database.py          # 数据库连接
├── models/              # SQLAlchemy模型
│   ├── __init__.py
│   ├── user.py
│   └── item.py
├── schemas/             # Pydantic模型(schemas)
│   ├── __init__.py
│   ├── user.py
│   └── item.py
├── routers/             # 路由模块
│   ├── __init__.py
│   ├── users.py         # /users
│   ├── items.py         # /items
│   ├── auth.py          # /auth
│   └── admin/           # 子模块
│       ├── __init__.py
│       └── stats.py
├── services/            # 业务逻辑层
│   ├── __init__.py
│   ├── user_service.py
│   └── item_service.py
└── utils/               # 工具函数
    └── security.py
\`\`\`

### main.py示例

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import users, items, auth, admin

app = FastAPI(
    title="My App API",
    description="这是一个FastAPI大型项目示例",
    version="1.0.0",
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router, prefix="/auth", tags=["认证"])
app.include_router(users.router, prefix="/users", tags=["用户管理"])
app.include_router(items.router, prefix="/items", tags=["商品管理"])
app.include_router(admin.router, prefix="/admin", tags=["管理后台"])

@app.get("/", tags=["根"])
async def root():
    return {"message": "Welcome to API"}
\`\`\`

### 嵌套路由

可以将router注册到另一个router上：

\`\`\`python
# routers/admin/__init__.py
from fastapi import APIRouter
from . import stats, users

router = APIRouter(prefix="/admin", tags=["管理后台"])

# 将子路由注册到admin router
router.include_router(stats.router, prefix="/stats")
router.include_router(users.router, prefix="/users")
\`\`\`

\`\`\`python
# routers/admin/stats.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_stats():
    return {"total_users": 100}
\`\`\`

## 六、高级路由配置

### 自定义响应类

\`\`\`python
from fastapi import APIRouter
from fastapi.responses import ORJSONResponse

router = APIRouter(default_response_class=ORJSONResponse)
\`\`\`

### 路由回调

\`\`\`python
from fastapi import FastAPI, Request
from fastapi.routing import APIRoute

class CustomAPIRoute(APIRoute):
    def get_route_handler(self):
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: Request):
            # 请求前处理
            print(f"Request: {request.method} {request.url}")
            response = await original_route_handler(request)
            # 响应后处理
            response.headers["X-Processed-By"] = "MyAPI"
            return response

        return custom_route_handler

# 使用自定义路由类
router = APIRouter(route_class=CustomAPIRoute)
# 或全局
app = FastAPI()
app.router.route_class = CustomAPIRoute
\`\`\`

### 废弃路由

\`\`\`python
from fastapi import APIRouter

router = APIRouter()

@router.get("/old-endpoint", deprecated=True, summary="旧接口（已废弃）")
async def old_endpoint():
    """
    此接口已废弃，请使用/new-endpoint
    """
    return {"message": "This endpoint is deprecated"}
\`\`\`

## 七、最佳实践

1. **按功能模块拆分router**：每个业务域一个router文件
2. **统一前缀命名**：/api/v1/users，带版本号
3. **tags有意义**：中文标签，在文档中清晰分组
4. **公共依赖放router级**：如认证依赖，不用每个接口都加
5. **routes只做参数解析和响应格式化**：业务逻辑放service层
6. **使用APIRouter而不是直接app**：便于测试和复用
7. **嵌套路由不要过深**：一般2-3层足够
8. **openapi_tags配置描述**：让文档更专业

## 八、常见坑点

\`\`\`python
# 坑1：router路径开头不要带斜杠（除了根路径）
router = APIRouter()

@router.get("")  # ✅ 正确
async def list_users():
    pass

@router.get("/")  # ⚠️ 注意prefix后面会是双斜杠？不，FastAPI会处理
async def list_users():
    pass

# 实际上FastAPI会正确处理 //，但建议统一风格

# 坑2：prefix重复添加
# 如果在创建router时加了prefix="/users"，
# include_router时又加prefix="/users"，会变成/users/users
router = APIRouter(prefix="/users")  # 一处即可
app.include_router(router)  # 不要重复加prefix

# 坑3：dependencies不生效
# 确保dependencies是列表，里面是Depends()
router = APIRouter(dependencies=[Depends(get_current_user)])  # ✅
# router = APIRouter(dependencies=Depends(get_current_user))  # ❌ 必须是列表

# 坑4：循环导入
# 如果两个router互相导入，会循环导入
# 解决：将公共依赖放到dependencies.py，使用字符串引用或延迟导入

# 坑5：路由顺序问题
# FastAPI按注册顺序匹配路由，固定路径要在参数路径之前
@router.get("/me")  # ✅ 放在 /{user_id} 之前
async def get_current_user():
    pass

@router.get("/{user_id}")
async def get_user(user_id: int):
    pass
# 如果反过来，/me会被匹配到user_id="me"导致类型错误
\`\`\``
  },
  {
    id: "pyb-12-7",
    group: "FastAPI核心",
    icon: "⚡",
    title: "依赖注入系统",
    content: `# 依赖注入系统

## 一、Depends基础

FastAPI有强大的依赖注入系统，用于复用通用逻辑。

\`\`\`python
from fastapi import FastAPI, Depends
from typing import Optional

app = FastAPI()

# 基础依赖：一个函数
async def common_parameters(
    q: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    return {"q": q, "skip": skip, "limit": limit}

# 使用依赖
@app.get("/items/")
async def read_items(commons: dict = Depends(common_parameters)):
    return commons

@app.get("/users/")
async def read_users(commons: dict = Depends(common_parameters)):
    return commons

# 访问 /items/?q=foo&skip=10&limit=20
# commons就是{"q": "foo", "skip": 10, "limit": 20}
\`\`\`

### 依赖的作用

依赖注入可以用来：
- 共享数据库连接
- 实现认证授权
- 通用参数解析（分页、过滤等）
- 速率限制
- 日志记录
- 任何需要在多个路由中复用的逻辑

## 二、类作为依赖

类也可以作为依赖，适合需要保存状态或有复杂逻辑的场景。

\`\`\`python
from fastapi import FastAPI, Depends
from typing import Optional

app = FastAPI()

# 类作为依赖
class PaginationParams:
    def __init__(
        self,
        page: int = 1,
        per_page: int = 20,
        order_by: Optional[str] = None,
        desc: bool = False
    ):
        self.page = page
        self.per_page = per_page
        self.offset = (page - 1) * per_page
        self.limit = per_page
        self.order_by = order_by
        self.desc = desc

# 使用类依赖
@app.get("/items/")
async def list_items(pagination: PaginationParams = Depends()):
    # 注意：Depends()不需要传参数，FastAPI会自动实例化
    return {
        "page": pagination.page,
        "per_page": pagination.per_page,
        "offset": pagination.offset,
        "limit": pagination.limit,
        "order_by": pagination.order_by,
        "desc": pagination.desc
    }

# 类依赖也可以传参数给__init__
class QueryParams:
    def __init__(self, default_limit: int = 20, max_limit: int = 100):
        self.default_limit = default_limit
        self.max_limit = max_limit

    def __call__(
        self,
        q: Optional[str] = None,
        limit: int = None
    ):
        return {
            "q": q,
            "limit": min(limit or self.default_limit, self.max_limit)
        }

# 创建带配置的依赖实例
item_query = QueryParams(default_limit=10, max_limit=50)
user_query = QueryParams(default_limit=20, max_limit=100)

@app.get("/items/")
async def list_items(params: dict = Depends(item_query)):
    return params

@app.get("/users/")
async def list_users(params: dict = Depends(user_query)):
    return params
\`\`\`

### 更清晰的类依赖（使用Pydantic）

\`\`\`python
from fastapi import Depends
from pydantic import BaseModel, Field

class PaginationParams(BaseModel):
    page: int = Field(1, ge=1, description="页码")
    per_page: int = Field(20, ge=1, le=100, description="每页数量")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.per_page

    @property
    def limit(self) -> int:
        return self.per_page

@app.get("/items/")
async def list_items(pagination: PaginationParams = Depends()):
    return {
        "data": [],
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "offset": pagination.offset
        }
    }
\`\`\`

## 三、嵌套依赖

依赖可以嵌套依赖，形成依赖树。

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 第一层：获取token
async def get_token(token: str = Depends(oauth2_scheme)):
    return token

# 第二层：解析token获取当前用户
async def get_current_user(token: str = Depends(get_token)):
    # 模拟解析token
    user = decode_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    return user

# 第三层：检查用户是否激活
async def get_current_active_user(current_user = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# 第四层：检查用户是否是管理员
async def get_admin_user(current_user = Depends(get_current_active_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin required")
    return current_user

# 使用：只需要声明最终依赖，FastAPI会解析整个链
@app.get("/profile/")
async def read_profile(user = Depends(get_current_active_user)):
    return user

@app.get("/admin/stats/")
async def admin_stats(admin = Depends(get_admin_user)):
    return {"stats": "..."}
\`\`\`

### 数据库依赖嵌套示例

\`\`\`python
from fastapi import Depends
from sqlalchemy.orm import Session

# 数据库连接依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 基于数据库的User CRUD依赖
class UserRepository:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def get_by_id(self, user_id: int):
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str):
        return self.db.query(User).filter(User.email == email).first()

# 使用
@app.get("/users/{user_id}")
async def get_user(
    user_id: int,
    user_repo: UserRepository = Depends()
):
    user = user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(404)
    return user
\`\`\`

## 四、yield依赖(teardown)

使用yield可以编写带有清理逻辑的依赖（类似上下文管理器）。

\`\`\`python
from fastapi import FastAPI, Depends
from typing import Optional

app = FastAPI()

# 数据库会话依赖（带清理）
async def get_db():
    db = DBSession()
    try:
        yield db  # yield之前的代码：请求前
    finally:
        db.close()  # yield之后的代码：请求后（即使异常也执行）

# 使用yield依赖
@app.get("/items/")
async def list_items(db = Depends(get_db)):
    items = db.query(Item).all()
    return items
\`\`\`

### yield依赖执行顺序

\`\`\`python
from fastapi import Depends

async def dependency_a():
    print("A: before yield")
    try:
        yield "a"
    finally:
        print("A: after yield")

async def dependency_b(a: str = Depends(dependency_a)):
    print("B: before yield")
    try:
        yield f"b + {a}"
    finally:
        print("B: after yield")

@app.get("/test")
async def test(b: str = Depends(dependency_b)):
    print("Route handler")
    return {"result": b}

# 执行顺序：
# 1. A: before yield
# 2. B: before yield
# 3. Route handler
# 4. B: after yield
# 5. A: after yield
#
# 注意：响应发送后才执行after yield代码
# 所以yield后的代码不要修改response！
\`\`\`

### 常见yield依赖场景

\`\`\`python
# 1. 文件操作
async def get_temp_file():
    import tempfile
    f = tempfile.NamedTemporaryFile(delete=False)
    try:
        yield f
    finally:
        f.close()
        import os
        os.unlink(f.name)  # 删除临时文件

# 2. 锁/事务
async def get_transaction(db = Depends(get_db)):
    transaction = db.begin()
    try:
        yield transaction
        transaction.commit()
    except Exception:
        transaction.rollback()
        raise

# 3. HTTP客户端
import httpx

async def get_http_client():
    async with httpx.AsyncClient() as client:
        yield client

# 4. Redis连接
async def get_redis():
    redis = await aioredis.from_url("redis://localhost")
    try:
        yield redis
    finally:
        await redis.close()
\`\`\`

## 五、全局依赖

全局依赖作用于整个应用或整个router。

\`\`\`python
from fastapi import FastAPI, Depends, Request, HTTPException
import time

# 全局依赖 - 应用级别
async def verify_api_key(request: Request):
    api_key = request.headers.get("X-API-Key")
    if not api_key or api_key != "expected-key":
        raise HTTPException(status_code=403, detail="Invalid API key")

app = FastAPI(dependencies=[Depends(verify_api_key)])

# 全局依赖也可以放在include_router
app.include_router(
    admin_router,
    dependencies=[Depends(get_admin_user)]
)

# 中间件式的依赖（记录请求时间）
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
\`\`\`

## 六、依赖缓存与覆盖

### 依赖缓存

同一个请求中，如果多个地方依赖同一个依赖，依赖只会执行一次，结果被缓存。

\`\`\`python
from fastapi import FastAPI, Depends

app = FastAPI()

async def get_shared_value():
    # 这个函数在一个请求中只会执行一次，
    # 即使多个路由/依赖都Depends它
    print("get_shared_value called")
    return {"value": 42}

@app.get("/route1")
async def route1(shared = Depends(get_shared_value)):
    return shared

@app.get("/route2")
async def route2(shared = Depends(get_shared_value)):
    # 如果route1和route2在同一请求中不会同时调用
    # 但如果在嵌套依赖中多次Depends同一函数，会缓存
    return shared
\`\`\`

### 依赖覆盖（测试用）

测试时可以用测试依赖覆盖真实依赖：

\`\`\`python
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient

app = FastAPI()

# 真实依赖
async def get_current_user():
    return {"id": 1, "username": "real-user"}

@app.get("/profile")
async def profile(user = Depends(get_current_user)):
    return user

# 测试时覆盖依赖
async def fake_current_user():
    return {"id": 999, "username": "test-user"}

client = TestClient(app)
app.dependency_overrides[get_current_user] = fake_current_user

response = client.get("/profile")
assert response.json()["username"] == "test-user"

# 清除覆盖
app.dependency_overrides.clear()
\`\`\`

## 七、最佳实践

1. **依赖函数短小单一**：每个依赖只做一件事
2. **数据库连接用yield依赖**：确保连接正确关闭
3. **认证逻辑用多层嵌套依赖**：get_token → get_current_user → get_admin_user
4. **分页参数写成类依赖**：PaginationParams复用性高
5. **不要在依赖中修改响应**：yield后的代码在响应发送后执行
6. **善用依赖覆盖进行测试**：Mock数据库、外部服务
7. **类依赖优于函数返回dict**：Pydantic模型或类有类型提示，更清晰
8. **全局依赖谨慎使用**：影响所有路由，可能导致意外

### 常见依赖模式

\`\`\`python
# 分页参数
class Pagination:
    def __init__(self, page: int = 1, per_page: int = 20):
        self.page = page
        self.per_page = per_page
        self.offset = (page - 1) * per_page

# 认证
async def get_current_user(token: str = Depends(oauth2_scheme)):
    ...

# 数据库
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 过滤器
class ItemFilter:
    def __init__(
        self,
        category: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        keyword: Optional[str] = None,
    ):
        self.category = category
        self.min_price = min_price
        self.max_price = max_price
        self.keyword = keyword
\`\`\`

## 八、常见坑点

\`\`\`python
# 坑1：yield依赖中修改response无效
async def bad_dependency(response: Response):
    yield
    response.headers["X-Header"] = "value"  # ❌ 响应已发送，修改无效

# 如果要修改response，在yield之前做
async def good_dependency(response: Response):
    response.headers["X-Header"] = "value"  # ✅ 在yield前设置
    yield

# 坑2：忘记处理依赖中的异常
# yield后的代码（finally块）即使异常也会执行
# 但try/except可以捕获异常
async def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()  # 异常时回滚
        raise
    finally:
        db.close()

# 坑3：Depends()传参错误
# 类作为依赖时，如果类没有__call__，直接Depends(Class) 或 Depends()
class MyDep:
    def __init__(self, q: Optional[str] = None):
        self.q = q

@app.get("/test")
async def test(dep: MyDep = Depends()):  # ✅ FastAPI自动注入__init__参数
    pass

# 坑4：依赖中使用普通def而非async def没问题
# FastAPI会自动处理，在线程池中运行
def get_db():  # 普通def，同步代码
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 坑5：不要在依赖之间用全局变量共享状态
# 用request.state或g来存储请求级别的状态
from fastapi import Request

async def auth_dep(request: Request):
    request.state.user = user  # ✅ 正确方式
\`\`\``
  },
  {
    id: "pyb-12-8",
    group: "FastAPI核心",
    icon: "⚡",
    title: "中间件与CORS",
    content: `# 中间件与CORS

## 一、中间件编写(@app.middleware("http"))

中间件可以在请求进入路由前、响应返回后进行处理。

\`\`\`python
from fastapi import FastAPI, Request
import time

app = FastAPI()

# 基础中间件
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    # 请求前处理
    start_time = time.time()

    # 调用下一个中间件或路由处理
    response = await call_next(request)

    # 响应后处理
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-API-Version"] = "1.0.0"

    return response
\`\`\`

### 中间件执行顺序

中间件按注册顺序（从上到下）执行请求前代码，按逆序执行响应后代码：

\`\`\`python
@app.middleware("http")
async def middleware1(request: Request, call_next):
    print("Middleware 1 - before")
    response = await call_next(request)
    print("Middleware 1 - after")
    return response

@app.middleware("http")
async def middleware2(request: Request, call_next):
    print("Middleware 2 - before")
    response = await call_next(request)
    print("Middleware 2 - after")
    return response

# 请求流程：
# Client → Middleware1 before → Middleware2 before → Route
#        → Middleware2 after → Middleware1 after → Client
\`\`\`

### 常用中间件示例

\`\`\`python
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
import time
import uuid
import logging

app = FastAPI()
logger = logging.getLogger(__name__)

# 1. 请求ID中间件
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id

    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# 2. 日志中间件
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    # 记录请求信息
    logger.info(f"Request started: {request.method} {request.url.path}")

    response = await call_next(request)

    process_time = (time.time() - start_time) * 1000
    logger.info(
        f"Request completed: {request.method} {request.url.path} "
        f"- Status: {response.status_code} - {process_time:.2f}ms"
    )

    return response

# 3. 认证中间件（不推荐用中间件做认证，用依赖更灵活）
@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    # 跳过公开路径
    public_paths = ["/docs", "/redoc", "/openapi.json", "/auth/login"]
    if request.url.path in public_paths:
        return await call_next(request)

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=401,
            content={"detail": "Not authenticated"}
        )

    token = auth_header.replace("Bearer ", "")
    # 验证token...
    if not verify_token(token):
        return JSONResponse(status_code=401, content={"detail": "Invalid token"})

    return await call_next(request)

# 4. 速率限制中间件（简单示例）
from collections import defaultdict
from datetime import datetime, timedelta

request_counts = defaultdict(list)
RATE_LIMIT = 100  # 每分钟100次

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    now = datetime.now()
    window = now - timedelta(minutes=1)

    # 清理过期记录
    request_counts[client_ip] = [
        t for t in request_counts[client_ip] if t > window
    ]

    if len(request_counts[client_ip]) >= RATE_LIMIT:
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests"},
            headers={"Retry-After": "60"}
        )

    request_counts[client_ip].append(now)
    return await call_next(request)
\`\`\`

### 在中间件中获取请求体

注意：请求体是流，读取后需要让路由还能读取。

\`\`\`python
from fastapi import FastAPI, Request
import json

app = FastAPI()

@app.middleware("http")
async def log_request_body(request: Request, call_next):
    # 读取请求体（需要await）
    body = await request.body()

    # 如果是JSON，可以解析
    if request.headers.get("content-type") == "application/json":
        try:
            body_json = json.loads(body)
            # 记录，但注意不要记录敏感字段如密码
            logger.info(f"Request body: {body_json}")
        except json.JSONDecodeError:
            pass

    # 关键：将body放回，否则路由无法读取！
    # FastAPI/Starlette中，request.body()读取后需要重新设置
    # 但实际上，Starlette的request.body()会缓存，多次await是安全的
    # 但是如果要使用request.stream()，需要小心

    response = await call_next(request)
    return response
\`\`\`

### 中间件中返回响应（短路请求）

可以在中间件中直接返回响应，不调用call_next。

\`\`\`python
@app.middleware("http")
async def maintenance_middleware(request: Request, call_next):
    MAINTENANCE_MODE = False  # 从配置读取

    if MAINTENANCE_MODE:
        return JSONResponse(
            status_code=503,
            content={"detail": "Service is under maintenance"},
            headers={"Retry-After": "3600"}
        )

    return await call_next(request)
\`\`\`

## 二、CORSMiddleware配置

CORS（Cross-Origin Resource Sharing）跨域资源共享是前后端分离项目必须配置的。

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源（开发环境）
    allow_credentials=True,  # 允许携带Cookie
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有请求头
)
\`\`\`

### 生产环境CORS配置

\`\`\`python
# 生产环境：明确指定允许的来源
origins = [
    "https://example.com",
    "https://www.example.com",
    "https://admin.example.com",
    "http://localhost:3000",  # 本地开发
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "X-Requested-With",
        "X-CSRF-Token",
    ],
    expose_headers=["X-Request-ID"],  # 前端可读取的响应头
    max_age=600,  # 预检请求缓存时间（秒）
)
\`\`\`

### CORS参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| allow_origins | list[str] | 允许的来源列表，["*"]允许所有 |
| allow_origin_regex | str | 用正则匹配来源 |
| allow_methods | list[str] | 允许的HTTP方法，["*"]允许所有 |
| allow_headers | list[str] | 允许的请求头，["*"]允许所有 |
| allow_credentials | bool | 是否允许携带Cookie/Authorization |
| expose_headers | list[str] | 暴露给前端的响应头 |
| max_age | int | 预检请求（OPTIONS）缓存时间（秒） |

\`\`\`python
# 使用正则匹配来源
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\\.example\\.com",  # 所有子域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
\`\`\`

## 三、自定义请求头处理

\`\`\`python
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse

app = FastAPI()

# 自定义请求头验证中间件
@app.middleware("http")
async def validate_custom_headers(request: Request, call_next):
    # 要求API请求必须有X-API-Version头
    if request.url.path.startswith("/api/"):
        api_version = request.headers.get("X-API-Version")
        if not api_version:
            return JSONResponse(
                status_code=400,
                content={"detail": "X-API-Version header is required"}
            )
        if api_version not in ["1", "2"]:
            return JSONResponse(
                status_code=400,
                content={"detail": f"Unsupported API version: {api_version}"}
            )
        request.state.api_version = int(api_version)

    return await call_next(request)

# 在路由中访问
@app.get("/api/items")
async def list_items(request: Request):
    version = request.state.api_version
    if version == 2:
        return {"version": 2, "items": []}
    return {"version": 1, "items": []}
\`\`\`

### 添加安全响应头

\`\`\`python
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)

    # 安全相关响应头
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    return response
\`\`\`

## 四、GZip压缩

GZip中间件可以压缩响应，减少传输大小。

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI()

# 最小压缩大小（字节），小于这个大小不压缩
app.add_middleware(GZipMiddleware, minimum_size=1000)

# GZip会自动压缩这些类型：
# - text/*
# - application/json
# - application/javascript
# - application/xml
# 等等
\`\`\`

## 五、HTTPSRedirectMiddleware

强制HTTPS重定向：

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

app = FastAPI()

# 生产环境启用，所有HTTP请求重定向到HTTPS
# app.add_middleware(HTTPSRedirectMiddleware)

# 注意：通常在Nginx等反向代理层做HTTPS重定向更好
\`\`\`

## 六、TrustedHostMiddleware

防止Host头攻击：

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app = FastAPI()

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["example.com", "*.example.com", "localhost", "127.0.0.1"]
)
\`\`\`

## 七、其他内置中间件

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.wsgi import WSGIMiddleware  # 挂载WSGI应用（如Flask/Django）
from starlette.middleware.sessions import SessionMiddleware  # Session支持

app = FastAPI()

# Session中间件（需要secret key）
app.add_middleware(SessionMiddleware, secret_key="your-secret-key")

# 可以在同一个ASGI应用中挂载WSGI应用
# from flask import Flask
# flask_app = Flask(__name__)
# app.mount("/flask", WSGIMiddleware(flask_app))
\`\`\`

## 八、最佳实践

1. **中间件保持精简**：不要在中间件放太多业务逻辑，用依赖注入更灵活
2. **CORS生产环境不要用"*"**：明确指定允许的域名
3. **GZip在反向代理层做更好**：Nginx的GZip比Python更高效
4. **HTTPS重定向在Nginx层做**：应用层做不如反向代理层高效
5. **添加安全响应头**：X-Content-Type-Options、X-Frame-Options等
6. **速率限制用专业方案**：生产环境用Redis+Lua或API网关，不要自己写内存版
7. **日志中间件不要记录敏感信息**：密码、token等要过滤
8. **异常不影响后续中间件**：await call_next()的异常会向上传播，注意处理

### 推荐的中间件顺序

\`\`\`python
# 1. CORS - 最早处理跨域
app.add_middleware(CORSMiddleware, ...)

# 2. TrustedHost - Host验证
app.add_middleware(TrustedHostMiddleware, ...)

# 3. GZip - 压缩（注意顺序）
app.add_middleware(GZipMiddleware, ...)

# 4. HTTPS重定向
# app.add_middleware(HTTPSRedirectMiddleware)

# 5. Session
app.add_middleware(SessionMiddleware, ...)

# 6. 自定义中间件（日志、请求ID等）
@app.middleware("http")
async def request_id_middleware(...): ...

@app.middleware("http")
async def logging_middleware(...): ...

@app.middleware("http")
async def security_headers_middleware(...): ...
\`\`\`

## 九、常见坑点

\`\`\`python
# 坑1：中间件中必须await call_next(request)
# 忘记await会导致响应不正确
@app.middleware("http")
async def bad_middleware(request: Request, call_next):
    response = call_next(request)  # ❌ 忘记await
    return response

@app.middleware("http")
async def good_middleware(request: Request, call_next):
    response = await call_next(request)  # ✅
    return response

# 坑2：CORS allow_credentials=True时不能用allow_origins=["*"]
# 浏览器规范要求：allow_credentials=True时必须指定具体origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # ✅ 具体域名
    # allow_origins=["*"],  # ❌ credentials=True时不能用*
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 坑3：中间件中读取request.json()/request.body()后路由无法获取问题
# Starlette的request.body()会缓存，多次调用是安全的
# 但如果使用request.stream()，流只能消费一次
@app.middleware("http")
async def bad_middleware(request: Request, call_next):
    async for chunk in request.stream():  # 流式读取后流会被消费
        process(chunk)
    # 之后路由无法再读取body
    response = await call_next(request)
    return response

# 解决：先await request.body()读取全部内容，这会缓存
@app.middleware("http")
async def good_middleware(request: Request, call_next):
    body = await request.body()
    # 处理body...
    # 之后路由仍然可以读取body（已缓存）
    response = await call_next(request)
    return response

# 坑4：中间件异常处理
# 如果中间件本身抛出异常，后续中间件和路由不会执行
# 需要在中间件中处理异常
@app.middleware("http")
async def safe_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"Unhandled error: {e}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )

# 坑5：不要在中间件中做认证
# 用依赖注入Depends()更灵活，可以针对特定路由
# 中间件是全局的，很难跳过某些路径
\`\`\``
  }
]
