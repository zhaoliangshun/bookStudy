// =============================================================
// Python后端面试指南 - 第14批章节（API设计 8章）
// =============================================================

export const chapters = [
  {
    id: "pyb-14-1",
    group: "API设计（REST/GraphQL/gRPC）",
    icon: "🔌",
    title: "RESTful API设计原则",
    content: `

# RESTful API设计原则

## 一、REST成熟度模型

### 1.1 Richardson成熟度模型

Leonard Richardson提出的REST成熟度模型将API分为4个级别（0-3级）：

| 级别 | 名称 | 特征 | 示例 |
|------|------|------|------|
| Level 0 | HTTP沼泽 | 单个URL，单个HTTP方法(POST) | POST /app?action=getUser&id=1 |
| Level 1 | 资源 | 多个URL，按资源划分 | GET /getUser?id=1 |
| Level 2 | HTTP动词 | 正确使用HTTP方法和状态码 | GET /users/1, POST /users |
| Level 3 | HATEOAS | 响应包含链接指引 | 返回资源时包含相关操作链接 |

### 1.2 Level 0 - 基础形式

\`\`\`python
# Level 0：所有操作都是POST
@app.post("/api")
async def api(request: Request):
    data = await request.json()
    action = data.get("action")
    if action == "get_user":
        return {"user": get_user(data["id"])}
    elif action == "create_user":
        return {"user": create_user(data)}
    elif action == "delete_user":
        delete_user(data["id"])
        return {"success": True}
\`\`\`

### 1.3 Level 2 - RESTful API（推荐目标）

\`\`\`python
# Level 2：正确使用HTTP方法和状态码
@app.get("/users/{user_id}", status_code=200)
async def get_user(user_id: int):
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user

@app.post("/users", status_code=201)
async def create_user(user: UserCreate):
    return create_new_user(user)

@app.put("/users/{user_id}")
async def update_user(user_id: int, user: UserUpdate):
    return update_existing_user(user_id, user)

@app.delete("/users/{user_id}", status_code=204)
async def delete_user(user_id: int):
    delete_user_by_id(user_id)
\`\`\`

---

## 二、资源命名规范

### 2.1 命名原则

| 原则 | 正确示例 | 错误示例 |
|------|---------|---------|
| 使用名词复数 | /users, /articles | /getUser, /createArticle |
| 小写字母 | /users/{id} | /Users, /Users/{ID} |
| 连字符分隔 | /user-profiles | /user_profiles, /userProfiles |
| 层级关系 | /users/{id}/articles | /getUserArticles?id=1 |
| 避免动词 | POST /users | /createUser (POST已表示创建) |

### 2.2 资源层级设计

\`\`\`python
# 集合资源
GET /users                    # 用户列表
GET /articles                 # 文章列表

# 单个资源
GET /users/123                # ID为123的用户
GET /articles/456             # ID为456的文章

# 子资源
GET /users/123/articles       # 用户123的所有文章
GET /users/123/articles/456   # 用户123的文章456

# 特殊操作（当无法映射到CRUD时）
POST /users/123/resend-verification-email
POST /articles/456/publish
POST /orders/789/cancel
\`\`\`

### 2.3 查询vs路径参数

\`\`\`python
# 路径参数：用于资源定位
@app.get("/users/{user_id}")
async def get_user(user_id: int):
    pass

# 查询参数：用于过滤、排序、分页
@app.get("/users")
async def list_users(
    page: int = 1,
    page_size: int = 20,
    role: str = None,
    is_active: bool = None,
    sort_by: str = "created_at",
    order: str = "desc"
):
    pass
\`\`\`

---

## 三、HTTP方法语义

### 3.1 HTTP方法详解

| 方法 | 语义 | 幂等 | 安全 | 请求体 | 响应体 |
|------|------|------|------|--------|--------|
| GET | 获取资源 | ✅ | ✅ | ❌ | ✅ |
| POST | 创建资源 | ❌ | ❌ | ✅ | ✅ |
| PUT | 替换/创建资源 | ✅ | ❌ | ✅ | ✅ |
| PATCH | 部分更新 | ❌ | ❌ | ✅ | ✅ |
| DELETE | 删除资源 | ✅ | ❌ | ❌ | 可选 |
| HEAD | 同GET但只返回头 | ✅ | ✅ | ❌ | ❌ |
| OPTIONS | 获取支持的方法 | ✅ | ✅ | ❌ | ❌ |

### 3.2 幂等性详解

幂等性：多次执行相同请求，服务器状态相同。

\`\`\`python
# GET - 幂等：多次查询结果相同
GET /users/123

# DELETE - 幂等：删除多次结果相同（资源已删除）
DELETE /users/123  # 第一次删除200/204，之后删除404也是可接受的

# PUT - 幂等：多次更新结果相同
PUT /users/123 {"name": "张三"}  # 每次都设置为张三

# POST - 不幂等：多次创建产生多个资源
POST /users {"name": "张三"}  # 每次创建新用户

# PATCH - 不保证幂等（取决于实现）
PATCH /users/123 {"balance_inc": 100}  # 每次加100，非幂等！
PATCH /users/123 {"balance": 1000}    # 设置为1000，幂等
\`\`\`

### 3.3 PUT vs PATCH

\`\`\`python
class UserUpdate(BaseModel):
    name: str
    email: str
    age: int

class UserPatch(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None

# PUT：完整替换，需要提供所有字段
@app.put("/users/{user_id}")
async def put_user(user_id: int, user: UserUpdate):
    db_user = get_user(user_id)
    if not db_user:
        raise HTTPException(404)
    for key, value in user.dict().items():
        setattr(db_user, key, value)
    db.commit()
    return db_user

# PATCH：部分更新，只提供需要修改的字段
@app.patch("/users/{user_id}")
async def patch_user(user_id: int, user: UserPatch):
    db_user = get_user(user_id)
    if not db_user:
        raise HTTPException(404)
    for key, value in user.dict(exclude_unset=True).items():
        setattr(db_user, key, value)
    db.commit()
    return db_user
\`\`\`

---

## 四、状态码使用规范

### 4.1 常用状态码分类

| 类别 | 码段 | 含义 |
|------|------|------|
| 2xx | 200-299 | 成功 |
| 3xx | 300-399 | 重定向 |
| 4xx | 400-499 | 客户端错误 |
| 5xx | 500-599 | 服务器错误 |

### 4.2 常用状态码详解

\`\`\`python
# 2xx 成功
200 OK                    # GET/PUT/PATCH成功
201 Created               # POST创建成功，Location头指向新资源
204 No Content            # DELETE成功，无返回内容
202 Accepted              # 异步任务已接受处理

# 3xx 重定向
301 Moved Permanently     # 永久重定向
302 Found                 # 临时重定向
304 Not Modified          # 缓存有效，使用本地缓存

# 4xx 客户端错误
400 Bad Request           # 请求参数错误
401 Unauthorized          # 未认证（未登录）
403 Forbidden             # 已认证但无权限
404 Not Found             # 资源不存在
405 Method Not Allowed    # HTTP方法不允许
409 Conflict              # 资源冲突（如重复创建）
422 Unprocessable Entity  # 参数验证失败（语义错误）
429 Too Many Requests     # 请求限流

# 5xx 服务器错误
500 Internal Server Error # 服务器内部错误
502 Bad Gateway           # 网关错误
503 Service Unavailable   # 服务不可用
504 Gateway Timeout       # 网关超时
\`\`\`

### 4.3 错误响应格式

\`\`\`python
class APIError(Exception):
    def __init__(self, code: int, message: str, details: dict = None):
        self.code = code
        self.message = message
        self.details = details or {}

@app.exception_handler(APIError)
async def api_error_handler(request: Request, exc: APIError):
    return JSONResponse(
        status_code=exc.code if exc.code >= 400 else 400,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
                "request_id": getattr(request.state, "request_id", None)
            }
        }
    )

# 使用示例
@app.get("/users/{user_id}")
async def get_user(user_id: int):
    user = db.query(User).get(user_id)
    if not user:
        raise APIError(404, "用户不存在", {"user_id": user_id})
    if not user.is_active:
        raise APIError(403, "用户已被禁用")
    return user
\`\`\`

---

## 五、HATEOAS

### 5.1 HATEOAS概念

HATEOAS（Hypermedia as the Engine of Application State）：响应中包含相关操作的链接，客户端可以根据链接发现可用的API。

### 5.2 HATEOAS实现示例

\`\`\`python
from fastapi.responses import JSONResponse
from fastapi import Request

def user_to_dict(user: User, request: Request) -> dict:
    base_url = str(request.base_url).rstrip("/")
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "_links": {
            "self": {"href": f"{base_url}/users/{user.id}"},
            "articles": {"href": f"{base_url}/users/{user.id}/articles"},
            "update": {
                "href": f"{base_url}/users/{user.id}",
                "method": "PUT"
            },
            "delete": {
                "href": f"{base_url}/users/{user.id}",
                "method": "DELETE"
            }
        }
    }

@app.get("/users/{user_id}")
async def get_user(user_id: int, request: Request):
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(404)
    return user_to_dict(user, request)

@app.get("/users")
async def list_users(request: Request, page: int = 1, page_size: int = 20):
    users = get_users_page(page, page_size)
    total = get_users_total()
    base_url = str(request.base_url).rstrip("/")

    return {
        "data": [user_to_dict(u, request) for u in users],
        "_links": {
            "self": {"href": f"{base_url}/users?page={page}&page_size={page_size}"},
            "next": {"href": f"{base_url}/users?page={page+1}&page_size={page_size}"} if page * page_size < total else None,
            "prev": {"href": f"{base_url}/users?page={page-1}&page_size={page_size}"} if page > 1 else None,
            "create": {
                "href": f"{base_url}/users",
                "method": "POST"
            }
        },
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total
        }
    }
\`\`\`

---

## 六、最佳实践与常见坑点

### 6.1 RESTful API设计清单

1. ✅ 使用名词复数形式命名资源
2. ✅ 正确使用HTTP方法（GET/POST/PUT/DELETE）
3. ✅ 使用正确的HTTP状态码
4. ✅ 返回统一的JSON格式
5. ✅ 使用查询参数进行过滤、排序、分页
6. ✅ 版本化API
7. ✅ 使用SSL/HTTPS
8. ✅ 提供清晰的错误信息
9. ✅ 支持分页获取大量数据
10. ✅ 使用HATEOAS（可选，Level 3）

### 6.2 常见坑点

**坑点1：在URL中使用动词**

\`\`\`python
# 错误：使用动词
@app.get("/getUser")
@app.post("/createUser")
@app.post("/deleteUser")

# 正确：使用HTTP方法表示动作
@app.get("/users/{user_id}")
@app.post("/users")
@app.delete("/users/{user_id}")
\`\`\`

**坑点2：所有响应都返回200状态码**

\`\`\`python
# 错误：所有响应都200，错误在body中表示
return {"code": 404, "message": "用户不存在"}  # 状态码还是200！

# 正确：使用正确的HTTP状态码
if not user:
    raise HTTPException(status_code=404, detail="用户不存在")
\`\`\`

**坑点3：GET请求使用请求体**

\`\`\`python
# 错误：GET请求不应有请求体
@app.get("/users")
async def get_users(filters: UserFilter):  # 不应使用Body
    pass

# 正确：GET参数使用查询参数
@app.get("/users")
async def get_users(
    status: str = None,
    role: str = None,
    page: int = 1
):
    pass
\`\`\`
`
  },
  {
    id: "pyb-14-2",
    group: "API设计（REST/GraphQL/gRPC）",
    icon: "🔌",
    title: "API版本控制",
    content: `

# API版本控制

## 一、版本控制策略对比

### 1.1 常见版本控制方式

| 方式 | 示例 | 优点 | 缺点 |
|------|------|------|------|
| URL路径 | /v1/users | 直观、易调试、缓存友好 | URL冗余 |
| Header | Accept: application/vnd.api.v1+json | URL干净 | 不易调试、需自定义Header |
| 查询参数 | /users?version=1 | 实现简单 | 不够正式、缓存问题 |
| 子域名 | v1.api.example.com | 隔离性好 | 跨域问题、部署复杂 |

---

## 二、URL路径版本

### 2.1 基础实现

\`\`\`python
from fastapi import FastAPI, APIRouter

app = FastAPI()

# v1路由
v1_router = APIRouter(prefix="/v1")

@v1_router.get("/users")
async def get_users_v1():
    return {"version": "v1", "users": [{"id": 1, "name": "用户1"}]}

@v1_router.get("/users/{user_id}")
async def get_user_v1(user_id: int):
    return {"version": "v1", "user": {"id": user_id}}

# v2路由
v2_router = APIRouter(prefix="/v2")

@v2_router.get("/users")
async def get_users_v2():
    return {
        "version": "v2",
        "data": [{"id": 1, "username": "用户1", "email": "user@example.com"}],
        "pagination": {"page": 1, "total": 100}
    }

# 注册路由
app.include_router(v1_router)
app.include_router(v2_router)
\`\`\`

### 2.2 版本化的Pydantic模型

\`\`\`python
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# v1 用户模型
class UserV1(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

# v2 用户模型（添加更多字段）
class UserV2(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime
    is_active: bool = True

    class Config:
        orm_mode = True

@v1_router.get("/users/{user_id}", response_model=UserV1)
async def get_user_v1(user_id: int):
    user = db.query(User).get(user_id)
    return {"id": user.id, "name": user.username}

@v2_router.get("/users/{user_id}", response_model=UserV2)
async def get_user_v2(user_id: int):
    return db.query(User).get(user_id)
\`\`\`

### 2.3 目录结构组织

\`\`\`
app/
├── main.py
└── api/
    ├── __init__.py
    ├── v1/
    │   ├── __init__.py
    │   ├── router.py
    │   ├── users.py
    │   └── schemas.py
    └── v2/
        ├── __init__.py
        ├── router.py
        ├── users.py
        └── schemas.py
\`\`\`

\`\`\`python
# app/api/v1/router.py
from fastapi import APIRouter
from app.api.v1 import users

v1_router = APIRouter(prefix="/v1")
v1_router.include_router(users.router, prefix="/users", tags=["v1-用户"])

# app/api/v2/router.py
from fastapi import APIRouter
from app.api.v2 import users

v2_router = APIRouter(prefix="/v2")
v2_router.include_router(users.router, prefix="/users", tags=["v2-用户"])

# app/main.py
from app.api.v1.router import v1_router
from app.api.v2.router import v2_router

app = FastAPI()
app.include_router(v1_router)
app.include_router(v2_router)
\`\`\`

---

## 三、Header版本控制

### 3.1 自定义Header实现

\`\`\`python
from fastapi import Header, HTTPException

async def get_api_version(x_api_version: str = Header("1.0")):
    if x_api_version not in ["1.0", "2.0"]:
        raise HTTPException(400, f"不支持的API版本: {x_api_version}")
    return x_api_version

@app.get("/users")
async def get_users(version: str = Depends(get_api_version)):
    if version == "1.0":
        return get_users_v1()
    else:
        return get_users_v2()
\`\`\`

### 3.2 Accept Header版本控制（更标准）

\`\`\`python
from fastapi import Header
import re

def parse_accept_version(accept: str = Header(...)) -> str:
    """解析Accept Header中的版本信息
    格式: application/vnd.myapp.v2+json
    """
    pattern = r"application/vnd\\.myapp\\.v(\\d+)\\+json"
    match = re.search(pattern, accept)
    if match:
        return match.group(1)
    return "1"  # 默认版本

@app.get("/users")
async def get_users(version: str = Depends(parse_accept_version)):
    if version == "1":
        return get_users_v1()
    elif version == "2":
        return get_users_v2()
    raise HTTPException(406, "不支持的版本")
\`\`\`

客户端使用：
\`\`\`javascript
fetch('/users', {
  headers: {
    'Accept': 'application/vnd.myapp.v2+json'
  }
})
\`\`\`

---

## 四、查询参数版本

### 4.1 查询参数版本实现

\`\`\`python
from fastapi import Query

@app.get("/users")
async def get_users(
    version: str = Query("1", description="API版本"),
    page: int = 1
):
    if version == "1":
        return get_users_v1(page=page)
    elif version == "2":
        return get_users_v2(page=page)
    raise HTTPException(400, "不支持的版本")
\`\`\`

调用方式：GET /users?version=2&page=1

---

## 五、版本兼容策略

### 5.1 向后兼容原则

| 修改类型 | 是否需要新版本 | 处理方式 |
|---------|--------------|---------|
| 添加新的可选字段 | ❌ 不需要 | 直接添加 |
| 添加新接口 | ❌ 不需要 | 直接添加 |
| 添加新的可选参数 | ❌ 不需要 | 默认值处理 |
| 删除字段 | ✅ 需要 | 新版本删除，旧版本保留 |
| 修改字段类型 | ✅ 需要 | 新版本修改 |
| 修改响应结构 | ✅ 需要 | 新版本重构 |

### 5.2 响应兼容处理

\`\`\`python
# 添加新字段 - 不破坏旧客户端
class UserResponse(BaseModel):
    id: int
    name: str
    email: Optional[str] = None  # 新增可选字段，旧客户端忽略即可
    avatar: Optional[str] = None

# 弃用字段 - 使用DeprecationWarning
from deprecated import deprecated

@v1_router.get("/users/{user_id}")
async def get_user_v1(user_id: int):
    import warnings
    warnings.warn("v1 API已弃用，请迁移到v2", DeprecationWarning)
    response = get_user_data(user_id)
    # 添加Deprecation header
    return JSONResponse(
        content=response,
        headers={
            "Deprecation": "true",
            "Sunset": "Wed, 31 Dec 2025 23:59:59 GMT",
            "Link": '</v2/users/{user_id}>; rel="successor-version"'
        }
    )
\`\`\`

---

## 六、废弃API流程

### 6.1 废弃策略

\`\`\`python
from datetime import datetime

def deprecated_api(sunset_date: str, successor: str = None):
    """废弃API装饰器"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            response = await func(*args, **kwargs)
            headers = {
                "Deprecation": "true",
                "Sunset": sunset_date,
                "Warning": '299 - "This API is deprecated and will be removed"',
            }
            if successor:
                headers["Link"] = f'<{successor}>; rel="successor-version"'

            if isinstance(response, JSONResponse):
                response.headers.update(headers)
            else:
                response = JSONResponse(content=response, headers=headers)
            return response
        return wrapper
    return decorator

# 使用示例
@v1_router.get("/old-endpoint")
@deprecated_api(
    sunset_date="2025-12-31",
    successor="/v2/new-endpoint"
)
async def old_endpoint():
    return {"message": "This API is deprecated"}
\`\`\`

### 6.2 版本生命周期管理

| 阶段 | 持续时间 | 行为 |
|------|---------|------|
| 新版本发布 | - | 添加新功能，推荐使用 |
| 旧版本弃用 | 6-12个月 | 返回Deprecation头，文档标记弃用 |
| 旧版本 Sunset | 到期后 | 返回410 Gone或重定向到新版本 |
| 旧版本移除 | Sunset后1-3个月 | 完全移除代码 |

\`\`\`python
# 返回410 Gone表示API已永久移除
@app.get("/v1/very-old-endpoint")
async def removed_endpoint():
    return JSONResponse(
        status_code=410,
        content={
            "error": {
                "code": 410,
                "message": "此API已永久移除，请使用v2版本",
                "new_url": "/v2/new-endpoint"
            }
        }
    )
\`\`\`

---

## 七、最佳实践与常见坑点

### 7.1 版本控制最佳实践

1. **从v1开始**：即使只有一个版本，也加上/v1前缀
2. **只在必要时升级版本**：能兼容就不要升版本
3. **版本号简洁**：使用v1, v2而不是v1.2.3
4. **充足的弃用周期**：给客户端足够时间迁移
5. **文档同步**：每个版本有对应的文档
6. **监控旧版本使用**：了解哪些客户端还在使用旧版本

### 7.2 常见坑点

**坑点1：不做版本控制，直接修改接口**

\`\`\`python
# 错误：直接修改返回结构，导致旧客户端崩溃
@app.get("/users")
async def get_users():
    # 原来返回 [{"id": 1, "name": "a"}]
    # 突然改成 {"data": [...], "total": 100}
    return {"data": users, "total": total}  # 旧客户端挂了！

# 正确：保持v1不变，v2使用新格式
@app.get("/v1/users")
async def get_users_v1():
    return [{"id": u.id, "name": u.username} for u in users]

@app.get("/v2/users")
async def get_users_v2():
    return {"data": users, "total": total, "page": page}
\`\`\`

**坑点2：版本号过于复杂**

\`\`\`python
# 不推荐：过于细粒度的版本
@app.get("/v1.2.3/users")

# 推荐：主版本号即可
@app.get("/v1/users")
\`\`\`
`
  },
  {
    id: "pyb-14-3",
    group: "API设计（REST/GraphQL/gRPC）",
    icon: "🔌",
    title: "分页/排序/过滤",
    content: `

# 分页/排序/过滤

## 一、分页方案对比

### 1.1 Offset/Limit分页 vs Cursor分页

| 特性 | Offset/Limit | Cursor（游标） |
|------|-------------|---------------|
| 实现难度 | 简单 | 中等 |
| 数据一致性 | 数据变化时可能重复/遗漏 | 一致性好 |
| 性能 | 大偏移量时慢 | 性能稳定 |
| 跳页 | 支持任意页 | 不支持跳页 |
| 总页数 | 可获取 | 需要单独查询 |
| 适用场景 | 小数据量、后台管理 | 无限滚动、大数据量、Feed流 |

---

## 二、Offset/Limit分页

### 2.1 基础实现

\`\`\`python
from fastapi import FastAPI, Query
from pydantic import BaseModel
from typing import List, Generic, TypeVar, Optional
from sqlalchemy.orm import Session

app = FastAPI()
T = TypeVar("T")

class PageResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def create(cls, items: List[T], total: int, page: int, page_size: int):
        return cls(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size
        )

@app.get("/users", response_model=PageResponse[UserResponse])
async def list_users(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db)
):
    offset = (page - 1) * page_size
    users = db.query(User).offset(offset).limit(page_size).all()
    total = db.query(User).count()
    return PageResponse.create(users, total, page, page_size)
\`\`\`

### 2.2 RFC 5988 Link头

使用Link头返回分页链接，符合REST规范：

\`\`\`python
from urllib.request import Request
from fastapi.responses import JSONResponse

def paginate(query, page: int, page_size: int, request: Request):
    """分页工具函数，生成Link头"""
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    base_url = str(request.url).split("?")[0]
    links = []
    total_pages = (total + page_size - 1) // page_size

    # 下一页
    if page < total_pages:
        links.append(f'<{base_url}?page={page+1}&page_size={page_size}>; rel="next"')
    # 上一页
    if page > 1:
        links.append(f'<{base_url}?page={page-1}&page_size={page_size}>; rel="prev"')
    # 第一页
    links.append(f'<{base_url}?page=1&page_size={page_size}>; rel="first"')
    # 最后一页
    links.append(f'<{base_url}?page={total_pages}&page_size={page_size}>; rel="last"')

    headers = {"Link": ", ".join(links)} if links else {}
    return items, total, headers

@app.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    request: Request = None,
    db: Session = Depends(get_db)
):
    query = db.query(User).filter(User.is_active == True)
    items, total, headers = paginate(query, page, page_size, request)

    return JSONResponse(
        content={
            "data": [u.to_dict() for u in items],
            "meta": {"total": total, "page": page, "page_size": page_size}
        },
        headers=headers
    )
\`\`\`

返回示例：
\`\`\`http
Link: <http://api.example.com/users?page=2&page_size=20>; rel="next",
      <http://api.example.com/users?page=1&page_size=20>; rel="prev",
      <http://api.example.com/users?page=1&page_size=20>; rel="first",
      <http://api.example.com/users?page=50&page_size=20>; rel="last"
X-Total-Count: 1000
\`\`\`

---

## 三、Cursor游标分页

### 3.1 Cursor分页实现

\`\`\`python
import base64
from datetime import datetime

def encode_cursor(value) -> str:
    """编码游标"""
    return base64.urlsafe_b64encode(str(value).encode()).decode()

def decode_cursor(cursor: str):
    """解码游标"""
    return base64.urlsafe_b64decode(cursor.encode()).decode()

class CursorPageResponse(BaseModel, Generic[T]):
    items: List[T]
    next_cursor: Optional[str] = None
    has_more: bool

@app.get("/articles")
async def list_articles(
    cursor: str = Query(None, description="游标"),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    query = db.query(Article).order_by(Article.created_at.desc(), Article.id.desc())

    if cursor:
        # 解析游标：格式为 created_at:id
        cursor_data = decode_cursor(cursor).split(":")
        last_created_at = datetime.fromisoformat(cursor_data[0])
        last_id = int(cursor_data[1])
        # WHERE (created_at < last) OR (created_at = last AND id < last_id)
        query = query.filter(
            or_(
                Article.created_at < last_created_at,
                and_(
                    Article.created_at == last_created_at,
                    Article.id < last_id
                )
            )
        )

    # 多取一条判断是否有更多
    items = query.limit(limit + 1).all()
    has_more = len(items) > limit
    items = items[:limit]

    next_cursor = None
    if has_more and items:
        last_item = items[-1]
        cursor_value = f"{last_item.created_at.isoformat()}:{last_item.id}"
        next_cursor = encode_cursor(cursor_value)

    return CursorPageResponse(
        items=items,
        next_cursor=next_cursor,
        has_more=has_more
    )
\`\`\`

### 3.2 多种分页方式支持

\`\`\`python
from enum import Enum

class PaginationType(str, Enum):
    OFFSET = "offset"
    CURSOR = "cursor"

@app.get("/posts")
async def list_posts(
    pagination_type: PaginationType = Query(PaginationType.OFFSET),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    cursor: str = Query(None),
    db: Session = Depends(get_db)
):
    if pagination_type == PaginationType.OFFSET:
        return offset_paginate(db.query(Post), page, page_size)
    else:
        return cursor_paginate(db.query(Post), cursor, page_size)
\`\`\`

---

## 四、排序参数设计

### 4.1 排序实现

\`\`\`python
from fastapi import Query

# 允许排序的字段白名单
ALLOWED_SORT_FIELDS = {"created_at", "updated_at", "title", "views", "id"}

def get_sort_params(
    sort_by: str = Query("created_at", description="排序字段"),
    order: str = Query("desc", regex="^(asc|desc)$", description="排序方向")
):
    if sort_by not in ALLOWED_SORT_FIELDS:
        raise HTTPException(400, f"不支持的排序字段: {sort_by}")
    return sort_by, order

@app.get("/articles")
async def list_articles(
    sort: tuple = Depends(get_sort_params),
    db: Session = Depends(get_db)
):
    sort_by, order = sort
    query = db.query(Article)

    # 动态排序
    column = getattr(Article, sort_by)
    if order == "desc":
        query = query.order_by(column.desc())
    else:
        query = query.order_by(column.asc())

    return query.all()
\`\`\`

### 4.2 多字段排序

\`\`\`python
def parse_sort(sort_str: str = Query("created_at:desc")):
    """解析多字段排序
    格式: field1:asc,field2:desc
    """
    sorts = []
    for item in sort_str.split(","):
        parts = item.strip().split(":")
        field = parts[0]
        direction = parts[1] if len(parts) > 1 else "asc"

        if field not in ALLOWED_SORT_FIELDS:
            raise HTTPException(400, f"不支持的排序字段: {field}")
        if direction not in ("asc", "desc"):
            raise HTTPException(400, f"不支持的排序方向: {direction}")

        column = getattr(Article, field)
        sorts.append(column.desc() if direction == "desc" else column.asc())

    return sorts

@app.get("/articles")
async def list_articles(
    sorts: list = Depends(parse_sort),
    db: Session = Depends(get_db)
):
    query = db.query(Article).order_by(*sorts)
    return query.all()

# 调用: GET /articles?sort=is_pinned:desc,created_at:desc
\`\`\`

---

## 五、多条件过滤

### 5.1 基础过滤

\`\`\`python
from typing import Optional
from datetime import date

class ArticleFilter(BaseModel):
    keyword: Optional[str] = None
    author_id: Optional[int] = None
    category_id: Optional[int] = None
    is_published: Optional[bool] = None
    tag: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

def apply_filters(query, filters: ArticleFilter):
    if filters.keyword:
        query = query.filter(
            or_(
                Article.title.contains(filters.keyword),
                Article.content.contains(filters.keyword)
            )
        )
    if filters.author_id:
        query = query.filter(Article.author_id == filters.author_id)
    if filters.category_id:
        query = query.filter(Article.category_id == filters.category_id)
    if filters.is_published is not None:
        query = query.filter(Article.is_published == filters.is_published)
    if filters.tag:
        query = query.filter(Article.tags.any(name=filters.tag))
    if filters.start_date:
        query = query.filter(Article.created_at >= filters.start_date)
    if filters.end_date:
        query = query.filter(Article.created_at <= filters.end_date)
    return query

@app.get("/articles")
async def list_articles(
    filters: ArticleFilter = Depends(),
    db: Session = Depends(get_db)
):
    query = db.query(Article)
    query = apply_filters(query, filters)
    return query.all()

# 调用: GET /articles?keyword=python&author_id=1&is_published=true
\`\`\`

### 5.2 高级过滤(RHS Colon语法)

\`\`\`python
# 格式: field:operator=value
# 例如: created_at:gte=2024-01-01, views:gt=1000

OPERATORS = {
    "eq": lambda col, val: col == val,
    "ne": lambda col, val: col != val,
    "gt": lambda col, val: col > val,
    "gte": lambda col, val: col >= val,
    "lt": lambda col, val: col < val,
    "lte": lambda col, val: col <= val,
    "like": lambda col, val: col.like(f"%{val}%"),
    "in": lambda col, val: col.in_(val.split(",")),
}

def parse_filter_param(filter_param: Optional[str] = Query(None)):
    if not filter_param:
        return []

    conditions = []
    for part in filter_param.split(","):
        if ":" not in part:
            continue
        field_op, value = part.split("=", 1)
        if ":" in field_op:
            field, op = field_op.split(":", 1)
        else:
            field, op = field_op, "eq"

        if field not in ALLOWED_FILTER_FIELDS:
            continue
        if op not in OPERATORS:
            continue

        column = getattr(Article, field)
        conditions.append(OPERATORS[op](column, value))

    return conditions

@app.get("/articles/search")
async def search_articles(
    filters: list = Depends(parse_filter_param),
    db: Session = Depends(get_db)
):
    query = db.query(Article)
    for condition in filters:
        query = query.filter(condition)
    return query.all()

# 调用: GET /articles/search?filter=views:gte=1000,created_at:gte=2024-01-01,category_id:in=1,2,3
\`\`\`

---

## 六、大数据量分页优化

### 6.1 性能问题与解决方案

Offset分页深度翻页性能问题：

\`\`\`sql
-- OFFSET 1000000 LIMIT 20 需要扫描1000020行！
SELECT * FROM articles ORDER BY created_at DESC LIMIT 20 OFFSET 1000000;
\`\`\`

解决方案：

\`\`\`python
from datetime import datetime
# 1. 使用游标分页（推荐）
# 2. 子查询优化
def fast_offset_paginate(query, page: int, page_size: int):
    """使用子查询优化深度分页"""
    offset = (page - 1) * page_size

    # 先查ID（覆盖索引快）
    subq = query.with_entities(Article.id).order_by(
        Article.created_at.desc()
    ).offset(offset).limit(page_size).subquery()

    # 再关联查完整数据
    items = db.query(Article).join(
        subq, Article.id == subq.c.id
    ).order_by(Article.created_at.desc()).all()

    return items

# 3. 使用seek方法（keyset pagination）
def keyset_paginate(last_id: int = None, last_date: datetime = None, limit: int = 20):
    query = db.query(Article).order_by(
        Article.created_at.desc(), Article.id.desc()
    )

    if last_id and last_date:
        query = query.filter(
            or_(
                Article.created_at < last_date,
                and_(
                    Article.created_at == last_date,
                    Article.id < last_id
                )
            )
        )

    return query.limit(limit).all()
\`\`\`

### 6.2 最大页数限制

\`\`\`python
MAX_PAGE = 100  # 限制最大页数

@app.get("/articles")
async def list_articles(page: int = Query(1, ge=1, le=MAX_PAGE)):
    if page > MAX_PAGE:
        raise HTTPException(400, f"页码不能超过{MAX_PAGE}，请使用游标分页")
    # ...
\`\`\`

---

## 七、最佳实践与常见坑点

### 7.1 分页最佳实践

1. **设置合理的page_size上限**：防止一次请求太多数据
2. **默认值设置**：page默认1，page_size默认20
3. **返回总条数**：便于前端计算总页数
4. **大偏移量用游标**：超过100页建议切换cursor分页
5. **排序字段加索引**：ORDER BY字段要有索引
6. **过滤字段白名单**：防止SQL注入和非法字段

### 7.2 常见坑点

**坑点1：OFFSET过大性能问题**

\`\`\`python
# 慢查询：OFFSET 1000000
query.offset(1000000).limit(20)

# 解决：使用游标分页或子查询优化
\`\`\`

**坑点2：排序和过滤时的SQL注入**

\`\`\`python
# 危险：直接使用用户输入的字段名排序
query.order_by(text(f"{sort_by} {order}"))  # SQL注入风险！

# 正确：白名单验证
if sort_by not in ALLOWED_SORT_FIELDS:
    raise HTTPException(400, "不支持的排序字段")
column = getattr(Article, sort_by)
query.order_by(column.desc() if order == "desc" else column)
\`\`\`

**坑点3：分页时数据重复/遗漏**

数据在分页过程中新增/删除会导致问题：
- 解决方案：使用游标分页
- 或在查询时使用固定条件（如只查创建时间在某个时间点之前的）
`
  },
  {
    id: "pyb-14-4",
    group: "API设计（REST/GraphQL/gRPC）",
    icon: "🔌",
    title: "API文档与规范",
    content: `

# API文档与规范

## 一、OpenAPI/Swagger规范

### 1.1 OpenAPI简介

OpenAPI规范（OAS）是RESTful API的标准描述格式，前身是Swagger规范。

| 版本 | 发布时间 | 主要特性 |
|------|---------|---------|
| Swagger 2.0 | 2014 | 基础API描述 |
| OpenAPI 3.0 | 2017 | 更好的组件复用、Callback、Link |
| OpenAPI 3.1 | 2021 | 完全兼容JSON Schema 2020-12 |

### 1.2 FastAPI自动文档

FastAPI内置自动生成OpenAPI文档的功能：

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

app = FastAPI(
    title="用户管理API",
    description="这是一个用户管理系统的API文档",
    version="1.0.0",
    terms_of_service="http://example.com/terms/",
    contact={
        "name": "API Support",
        "url": "http://example.com/support",
        "email": "support@example.com",
    },
    license_info={
        "name": "Apache 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0.html",
    },
    docs_url="/docs",       # Swagger UI地址
    redoc_url="/redoc",     # ReDoc地址
    openapi_url="/openapi.json"  # OpenAPI JSON地址
)

class UserResponse(BaseModel):
    """用户响应模型"""
    id: int = Field(..., description="用户ID", example=1)
    username: str = Field(..., description="用户名", example="zhangsan")
    email: str = Field(..., description="邮箱", example="zhangsan@example.com")
    created_at: datetime = Field(..., description="创建时间")
    is_active: bool = Field(True, description="是否激活")

    class Config:
        schema_extra = {
            "example": {
                "id": 1,
                "username": "zhangsan",
                "email": "zhangsan@example.com",
                "created_at": "2024-01-01T00:00:00",
                "is_active": True
            }
        }

class UserCreate(BaseModel):
    """创建用户请求模型"""
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    email: str = Field(..., description="邮箱")
    password: str = Field(..., min_length=6, description="密码")

@app.get(
    "/users/{user_id}",
    response_model=UserResponse,
    summary="获取用户详情",
    description="根据用户ID获取用户详细信息",
    response_description="用户信息",
    tags=["用户管理"],
    responses={
        200: {"description": "成功获取用户信息"},
        404: {"description": "用户不存在"},
        403: {"description": "无权限访问"}
    }
)
async def get_user(user_id: int = Field(..., description="用户ID", ge=1)):
    """
    获取用户详情接口：

    - **user_id**: 用户唯一标识ID
    """
    return get_user_by_id(user_id)

@app.post(
    "/users",
    response_model=UserResponse,
    status_code=201,
    summary="创建新用户",
    tags=["用户管理"]
)
async def create_user(user: UserCreate):
    """
    创建一个新用户：

    - **username**: 用户名，3-50个字符
    - **email**: 邮箱地址
    - **password**: 密码，至少6个字符
    """
    return create_new_user(user)
\`\`\`

### 1.3 自定义OpenAPI Schema

\`\`\`python
from fastapi.openapi.utils import get_openapi

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="自定义标题",
        version="2.0.0",
        description="这是自定义的API描述",
        routes=app.routes,
    )

    # 添加全局安全定义
    openapi_schema["components"]["securitySchemes"] = {
        "Bearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    # 添加服务器地址
    openapi_schema["servers"] = [
        {"url": "https://api.example.com/v1", "description": "生产环境"},
        {"url": "https://staging-api.example.com/v1", "description": "测试环境"},
        {"url": "http://localhost:8000", "description": "本地开发"}
    ]

    # 自定义Logo
    openapi_schema["info"]["x-logo"] = {
        "url": "https://example.com/logo.png"
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
\`\`\`

---

## 二、Swagger UI与ReDoc

### 2.1 Swagger UI定制

\`\`\`python
from fastapi.openapi.docs import get_swagger_ui_html

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Swagger UI",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
        swagger_favicon_url="/static/favicon.png",
        init_oauth={
            "clientId": "your-client-id",
            "appName": "Your App Name",
            "usePkceWithAuthorizationCodeGrant": True,
        }
    )
\`\`\`

### 2.2 文档分组与标签

\`\`\`python
# 使用tags参数进行接口分组
tags_metadata = [
    {
        "name": "用户管理",
        "description": "用户注册、登录、信息管理等操作",
        "externalDocs": {
            "description": "用户管理文档",
            "url": "https://example.com/docs/users",
        },
    },
    {
        "name": "文章管理",
        "description": "文章的CRUD操作、发布、审核",
    },
    {
        "name": "系统管理",
        "description": "系统配置、日志、监控",
    },
]

app = FastAPI(openapi_tags=tags_metadata)

@app.get("/users", tags=["用户管理"])
async def list_users():
    pass

@app.get("/articles", tags=["文章管理"])
async def list_articles():
    pass
\`\`\`

---

## 三、API Blueprint

### 3.1 API Blueprint格式示例

虽然FastAPI默认使用OpenAPI，但也可以导出API Blueprint格式：

\`\`\`apib
FORMAT: 1A

# 用户管理API

这是一个用户管理系统的API文档。

## 用户集合 [/users]

### 获取用户列表 [GET]
获取系统中所有用户的列表。

+ Parameters
    + page: 1 (number, optional) - 页码
    + page_size: 20 (number, optional) - 每页数量

+ Response 200 (application/json)
    + Attributes
        + data (array[User])
        + total: 100 (number) - 总条数

### 创建新用户 [POST]
创建一个新的用户账户。

+ Request (application/json)
    + Attributes
        + username: zhangsan (required, string) - 用户名
        + email: zs@example.com (required, string) - 邮箱
        + password: secret123 (required, string) - 密码

+ Response 201 (application/json)
    + Attributes (User)

## 用户 [/users/{user_id}]

+ Parameters
    + user_id: 1 (number, required) - 用户ID

### 获取用户详情 [GET]
+ Response 200 (application/json)
    + Attributes (User)

+ Response 404 (application/json)
    + Attributes (Error)

### 更新用户信息 [PUT]
+ Request (application/json)
    + Attributes (UserUpdate)

+ Response 200 (application/json)
    + Attributes (User)

### 删除用户 [DELETE]
+ Response 204

## 数据结构

### User
+ id: 1 (number)
+ username: zhangsan (string)
+ email: zs@example.com (string)
+ created_at: 2024-01-01T00:00:00 (string)

### Error
+ code: 404 (number)
+ message: 用户不存在 (string)
\`\`\`

---

## 四、文档维护最佳实践

### 4.1 文档即代码

\`\`\`python
from enum import Enum

class UserRole(str, Enum):
    """用户角色枚举"""
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

class ErrorCode(str, Enum):
    """错误码枚举"""
    USER_NOT_FOUND = "USER_NOT_FOUND"
    EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS"
    INVALID_PASSWORD = "INVALID_PASSWORD"
    PERMISSION_DENIED = "PERMISSION_DENIED"

class ErrorResponse(BaseModel):
    """统一错误响应模型"""
    code: ErrorCode = Field(..., description="错误码")
    message: str = Field(..., description="错误消息")
    details: Optional[dict] = Field(None, description="错误详情")
    request_id: Optional[str] = Field(None, description="请求ID，用于排查问题")

    class Config:
        schema_extra = {
            "example": {
                "code": "USER_NOT_FOUND",
                "message": "用户不存在",
                "details": {"user_id": 999},
                "request_id": "req_abc123"
            }
        }

# 定义常用响应
common_responses = {
    400: {"model": ErrorResponse, "description": "请求参数错误"},
    401: {"model": ErrorResponse, "description": "未认证"},
    403: {"model": ErrorResponse, "description": "无权限"},
    404: {"model": ErrorResponse, "description": "资源不存在"},
    422: {"model": ErrorResponse, "description": "参数验证失败"},
    500: {"model": ErrorResponse, "description": "服务器内部错误"},
}

# 在路由中复用
@app.get(
    "/users/{user_id}",
    response_model=UserResponse,
    responses={**common_responses, 200: {"description": "成功"}}
)
async def get_user(user_id: int):
    pass
\`\`\`

### 4.2 文档版本管理

\`\`\`python
# 为不同版本提供不同的文档
@app.get("/v1/openapi.json", include_in_schema=False)
async def get_v1_openapi():
    return get_openapi(
        title="API v1",
        version="1.0.0",
        routes=[r for r in app.routes if "/v1/" in getattr(r, "path", "")]
    )

@app.get("/v2/openapi.json", include_in_schema=False)
async def get_v2_openapi():
    return get_openapi(
        title="API v2",
        version="2.0.0",
        routes=[r for r in app.routes if "/v2/" in getattr(r, "path", "")]
    )
\`\`\`

### 4.3 示例数据与描述

\`\`\`python
from pydantic import Field

class ArticleCreate(BaseModel):
    title: str = Field(
        ...,
        title="文章标题",
        description="文章的主标题，长度3-200字符",
        min_length=3,
        max_length=200,
        example="Python FastAPI入门教程"
    )
    content: str = Field(
        ...,
        title="文章内容",
        description="文章正文内容，支持Markdown格式",
        example="## 简介\n\nFastAPI是一个现代的Python Web框架..."
    )
    tags: List[str] = Field(
        default=[],
        title="标签",
        description="文章标签列表，最多5个",
        max_items=5,
        example=["Python", "FastAPI", "Web开发"]
    )
    category_id: int = Field(
        ...,
        title="分类ID",
        description="文章所属分类的ID",
        ge=1,
        example=1
    )

    class Config:
        schema_extra = {
            "example": {
                "title": "Python FastAPI入门教程",
                "content": "## 简介\\n\\nFastAPI是一个现代的Python Web框架...",
                "tags": ["Python", "FastAPI"],
                "category_id": 1
            }
        }
\`\`\`

---

## 五、自动化文档工具

### 5.1 使用Schemathesis进行API测试

\`\`\`python
# schemathesis可以根据OpenAPI schema自动生成测试用例
# pip install schemathesis

import schemathesis

schema = schemathesis.from_uri("http://localhost:8000/openapi.json")

@schema.parametrize()
def test_api(case):
    response = case.call()
    case.validate_response(response)
\`\`\`

### 5.2 导出Postman集合

\`\`\`python
# 可以使用开源工具将OpenAPI转换为Postman Collection
# pip install openapi2postman2

def generate_postman_collection():
    import requests
    import json

    openapi_json = requests.get("http://localhost:8000/openapi.json").json()

    # 使用openapi-to-postman转换
    # 或手动构建Postman Collection格式
    collection = {
        "info": {
            "name": app.title,
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "item": []
    }

    for path, methods in openapi_json["paths"].items():
        for method, details in methods.items():
            collection["item"].append({
                "name": details.get("summary", path),
                "request": {
                    "method": method.upper(),
                    "url": "{{baseUrl}}" + path,
                    "header": [{"key": "Content-Type", "value": "application/json"}],
                }
            })

    with open("postman_collection.json", "w") as f:
        json.dump(collection, f, indent=2, ensure_ascii=False)
\`\`\`

---

## 六、最佳实践与常见坑点

### 6.1 API文档最佳实践

1. **描述清晰**：每个接口、参数、字段都要有清晰的description
2. **示例完整**：提供真实可用的请求/响应示例
3. **错误详细**：列出所有可能的错误码和错误场景
4. **认证说明**：清晰说明认证方式、如何获取Token
5. **快速开始**：文档首页提供快速上手指南
6. **变更日志**：记录API的每个版本变更
7. **SDK示例**：提供多种语言的调用示例
8. **保持同步**：代码更新时文档必须同步更新

### 6.2 常见坑点

**坑点1：文档与代码不同步**

\`\`\`python
# 错误：代码改了，但文档描述没更新
@app.get("/users/{user_id}")
async def get_user(user_id: str):  # 实际接受字符串，但文档写的是integer
    """获取用户信息
    - user_id: 用户ID (integer)
    """
    pass

# 正确：使用Pydantic和FastAPI自动从模型生成文档，保证一致
class UserPathParams(BaseModel):
    user_id: int = Field(..., description="用户ID")

@app.get("/users/{user_id}")
async def get_user(params: UserPathParams = Depends()):
    pass
\`\`\`

**坑点2：缺少错误响应文档**

\`\`\`python
# 不推荐：只写成功响应
@app.get("/users/{user_id}")
async def get_user(user_id: int):
    pass

# 推荐：列出所有可能的响应
@app.get(
    "/users/{user_id}",
    responses={
        200: {"model": UserResponse, "description": "成功"},
        401: {"model": ErrorResponse, "description": "未登录"},
        403: {"model": ErrorResponse, "description": "无权限"},
        404: {"model": ErrorResponse, "description": "用户不存在"},
    }
)
async def get_user(user_id: int):
    pass
\`\`\`

**坑点3：不使用枚举而使用字符串**

\`\`\`python
# 不推荐：使用字符串，文档无法知道可选值
status: str = Query(..., description="状态")

# 推荐：使用Enum，文档会自动显示可选值
class StatusEnum(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

status: StatusEnum = Query(..., description="文章状态")
\`\`\`
`
  },
  {
    id: "pyb-14-5",
    group: "API设计（REST/GraphQL/gRPC）",
    icon: "🔌",
    title: "GraphQL基础",
    content: `

# GraphQL基础

## 一、GraphQL vs REST

### 1.1 核心概念对比

| 特性 | REST | GraphQL |
|------|------|---------|
| 端点 | 多个端点(/users, /articles) | 单个端点(/graphql) |
| 数据获取 | 服务端决定返回字段 | 客户端决定需要什么字段 |
| 版本 | 需要API版本控制 | 无需版本，渐进式演进 |
| 数据聚合 | 多次请求(under-fetching/over-fetching) | 一次请求获取所有需要的数据 |
| 类型系统 | 无强制类型 | 强类型Schema |
| 缓存 | HTTP缓存 | 需要额外实现 |
| 学习曲线 | 简单 | 相对陡峭 |

### 1.2 典型问题对比

**REST Over-fetching（获取过多数据）：**

\`\`\`
GET /users/1
响应：
{
  "id": 1,
  "username": "zhangsan",
  "email": "z***@example.com",
  "phone": "13800138000",
  "avatar": "https://...",
  "bio": "...",
  "created_at": "...",
  "address": { ... },
  "settings": { ... }
}
// 其实只需要id和username！
\`\`\`

**REST Under-fetching（获取不足）：**

\`\`\`
// 获取用户及其文章需要多次请求
GET /users/1          // 获取用户
GET /users/1/articles // 获取文章
GET /users/1/followers // 获取粉丝
// 3次请求！
\`\`\`

**GraphQL一次请求：**

\`\`\`graphql
query {
  user(id: 1) {
    id
    username
    articles {
      id
      title
    }
    followers {
      id
      username
    }
  }
}
\`\`\`

---

## 二、GraphQL Schema基础

### 2.1 类型定义

\`\`\`graphql
# scalar类型
scalar DateTime
scalar JSON

# 枚举类型
enum Role {
  ADMIN
  EDITOR
  VIEWER
}

# 对象类型
type User {
  id: ID!
  username: String!
  email: String!
  role: Role!
  isActive: Boolean!
  createdAt: DateTime!
  articles: [Article!]!
  profile: Profile
}

type Profile {
  bio: String
  avatar: String
  website: String
}

type Article {
  id: ID!
  title: String!
  content: String!
  author: User!
  tags: [String!]!
  isPublished: Boolean!
  createdAt: DateTime!
}

# 查询类型 - 所有读操作入口
type Query {
  user(id: ID!): User
  users(limit: Int = 20, offset: Int = 0): [User!]!
  article(id: ID!): Article
  articles(filter: ArticleFilter): [Article!]!
}

# 变更类型 - 所有写操作入口
type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
  createArticle(input: CreateArticleInput!): Article!
}

# 输入类型
input CreateUserInput {
  username: String!
  email: String!
  password: String!
  role: Role = VIEWER
}

input UpdateUserInput {
  username: String
  email: String
  password: String
}

input ArticleFilter {
  authorId: ID
  tag: String
  isPublished: Boolean
  keyword: String
}
\`\`\`

---

## 三、Graphene库使用

### 3.1 Graphene基础

\`\`\`python
# pip install graphene
import graphene
from datetime import datetime
from typing import List, Optional

# 定义枚举
class Role(graphene.Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

# 定义对象类型
class ProfileNode(graphene.ObjectType):
    bio = graphene.String()
    avatar = graphene.String()
    website = graphene.String()

class ArticleNode(graphene.ObjectType):
    id = graphene.ID(required=True)
    title = graphene.String(required=True)
    content = graphene.String(required=True)
    tags = graphene.List(graphene.String)
    is_published = graphene.Boolean(required=True)
    created_at = graphene.DateTime(required=True)
    author = graphene.Field(lambda: UserNode)

    def resolve_author(self, info):
        return get_user_by_id(self.author_id)

class UserNode(graphene.ObjectType):
    id = graphene.ID(required=True)
    username = graphene.String(required=True)
    email = graphene.String(required=True)
    role = graphene.Field(Role, required=True)
    is_active = graphene.Boolean(required=True)
    created_at = graphene.DateTime(required=True)
    profile = graphene.Field(ProfileNode)
    articles = graphene.List(ArticleNode)

    def resolve_articles(self, info):
        return get_articles_by_author(self.id)

    def resolve_profile(self, info):
        return get_user_profile(self.id)

# 输入类型
class CreateUserInput(graphene.InputObjectType):
    username = graphene.String(required=True)
    email = graphene.String(required=True)
    password = graphene.String(required=True)
    role = Role(default_value=Role.VIEWER)

class UpdateUserInput(graphene.InputObjectType):
    username = graphene.String()
    email = graphene.String()
    password = graphene.String()

# 查询
class Query(graphene.ObjectType):
    user = graphene.Field(UserNode, id=graphene.ID(required=True))
    users = graphene.List(
        UserNode,
        limit=graphene.Int(default_value=20),
        offset=graphene.Int(default_value=0)
    )
    article = graphene.Field(ArticleNode, id=graphene.ID(required=True))

    def resolve_user(self, info, id):
        user = get_user_by_id(int(id))
        if not user:
            return None
        return user

    def resolve_users(self, info, limit=20, offset=0):
        return get_users(limit=limit, offset=offset)

    def resolve_article(self, info, id):
        return get_article_by_id(int(id))

# 变更
class CreateUser(graphene.Mutation):
    class Arguments:
        input = CreateUserInput(required=True)

    user = graphene.Field(UserNode)
    ok = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, input):
        try:
            user = create_new_user(input)
            return CreateUser(user=user, ok=True, errors=None)
        except Exception as e:
            return CreateUser(user=None, ok=False, errors=[str(e)])

class Mutation(graphene.ObjectType):
    create_user = CreateUser.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)
\`\`\`

### 3.2 执行GraphQL查询

\`\`\`python
# 执行查询
query = """
query GetUser($id: ID!) {
    user(id: $id) {
        id
        username
        email
        articles {
            id
            title
        }
    }
}
"""

result = schema.execute(
    query,
    variables={"id": "1"},
    context_value={"request": request}  # 传递上下文
)

if result.errors:
    print("Errors:", result.errors)
else:
    print("Data:", result.data)
\`\`\`

---

## 四、Strawberry与FastAPI集成

### 4.1 Strawberry基础

Strawberry是一个现代的Python GraphQL库，使用类型注解：

\`\`\`python
# pip install strawberry-graphql
import strawberry
from typing import List, Optional
from datetime import datetime
from enum import Enum

@strawberry.enum
class Role(Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

@strawberry.type
class Profile:
    bio: Optional[str] = None
    avatar: Optional[str] = None
    website: Optional[str] = None

@strawberry.type
class Article:
    id: strawberry.ID
    title: str
    content: str
    tags: List[str]
    is_published: bool
    created_at: datetime
    author_id: strawberry.ID

    @strawberry.field
    def author(self) -> "User":
        return get_user_by_id(int(self.author_id))

@strawberry.type
class User:
    id: strawberry.ID
    username: str
    email: str
    role: Role
    is_active: bool
    created_at: datetime

    @strawberry.field
    def profile(self) -> Optional[Profile]:
        return get_user_profile(int(self.id))

    @strawberry.field
    def articles(self) -> List[Article]:
        return get_articles_by_author(int(self.id))

@strawberry.input
class CreateUserInput:
    username: str
    email: str
    password: str
    role: Role = Role.VIEWER

@strawberry.type
class MutationResponse:
    ok: bool
    errors: Optional[List[str]] = None
    user: Optional[User] = None

@strawberry.type
class Query:
    @strawberry.field
    def user(self, id: strawberry.ID) -> Optional[User]:
        return get_user_by_id(int(id))

    @strawberry.field
    def users(
        self,
        limit: int = 20,
        offset: int = 0
    ) -> List[User]:
        return get_users(limit=limit, offset=offset)

@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_user(self, input: CreateUserInput) -> MutationResponse:
        try:
            user = create_new_user(input)
            return MutationResponse(ok=True, user=user)
        except Exception as e:
            return MutationResponse(ok=False, errors=[str(e)])

schema = strawberry.Schema(query=Query, mutation=Mutation)
\`\`\`

### 4.2 FastAPI集成

\`\`\`python
# pip install strawberry-graphql[fastapi]
from fastapi import FastAPI, Depends, Request
from strawberry.fastapi import GraphQLRouter
from strawberry.permission import BasePermission
from strawberry.types import Info

app = FastAPI()

# 自定义上下文
async def get_context(request: Request):
    # 从请求中获取用户信息
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user = await get_current_user(token) if token else None
    return {
        "request": request,
        "user": user,
    }

# 权限类
class IsAuthenticated(BasePermission):
    message = "User is not authenticated"

    def has_permission(self, source, info: Info, **kwargs):
        return info.context.get("user") is not None

class IsAdmin(BasePermission):
    message = "Admin access required"

    def has_permission(self, source, info: Info, **kwargs):
        user = info.context.get("user")
        return user is not None and user.role == "admin"

# 使用权限
@strawberry.type
class Query:
    @strawberry.field(permission_classes=[IsAuthenticated])
    def me(self, info: Info) -> Optional[User]:
        return info.context["user"]

    @strawberry.field(permission_classes=[IsAdmin])
    def admin_stats(self) -> AdminStats:
        return get_admin_stats()

# 创建GraphQL路由
graphql_router = GraphQLRouter(
    schema,
    context_getter=get_context,
    graphiql=True,  # 启用GraphiQL界面
)

app.include_router(graphql_router, prefix="/graphql")
\`\`\`

访问 http://localhost:8000/graphql 即可使用GraphiQL界面。

---

## 五、DataLoader查询优化

### 5.1 N+1问题

\`\`\`python
# N+1问题示例
# 如果查询10个用户，每个用户有5篇文章
# 会执行：1次查用户 + 10次查文章 = 11次查询！

@strawberry.field
def articles(self) -> List[Article]:
    return get_articles_by_author(int(self.id))  # 每个用户执行一次SQL
\`\`\`

### 5.2 DataLoader解决N+1

\`\`\`python
# pip install aiomysql aiodataloader
from aiodataloader import DataLoader

class ArticleLoader(DataLoader):
    async def batch_load_fn(self, author_ids):
        # 批量查询：一次SQL查所有作者的文章
        articles = await db.fetch_all(
            "SELECT * FROM articles WHERE author_id = ANY($1)",
            [list(map(int, author_ids))]
        )

        # 按author_id分组
        articles_by_author = {}
        for article in articles:
            aid = str(article.author_id)
            if aid not in articles_by_author:
                articles_by_author[aid] = []
            articles_by_author[aid].append(article)

        # 按author_ids顺序返回
        return [articles_by_author.get(aid, []) for aid in author_ids]

# 初始化loader
async def get_context(request: Request):
    return {
        "request": request,
        "article_loader": ArticleLoader(),
    }

# 使用loader
@strawberry.field
async def articles(self, info: Info) -> List[Article]:
    loader = info.context["article_loader"]
    return await loader.load(self.id)
\`\`\`

---

## 六、最佳实践与常见坑点

### 6.1 GraphQL最佳实践

1. **Schema设计优先**：先设计Schema再实现Resolver
2. **使用DataLoader**：避免N+1查询问题
3. **分页标准化**：使用Relay风格的Connection
4. **错误处理**：统一错误格式，区分用户错误和系统错误
5. **权限控制**：在Resolver层面做权限校验
6. **查询复杂度限制**：防止恶意复杂查询
7. **持久化查询**：生产环境使用持久化查询提高安全性

\`\`\`python
# 查询复杂度限制示例
from graphql import validate, parse, ValidationRule

class QueryComplexityValidator(ValidationRule):
    def enter_field(self, node, *args):
        # 计算复杂度逻辑
        pass

# 限制查询深度
MAX_DEPTH = 7
MAX_COMPLEXITY = 1000
\`\`\`

### 6.2 常见坑点

**坑点1：N+1查询问题**

\`\`\`python
# 错误：每个关联都单独查询
def resolve_articles(self, info):
    return Article.query.filter_by(author_id=self.id).all()

# 正确：使用DataLoader批量查询
\`\`\`

**坑点2：过度暴露内部字段**

\`\`\`python
# 错误：直接暴露数据库模型，包含password等敏感字段
@strawberry.type
class User:
    id: int
    username: str
    password_hash: str  # 敏感字段不应暴露！

# 正确：只暴露需要的字段
@strawberry.type
class User:
    id: int
    username: str
    email: str
\`\`\`

**坑点3：没有分页限制**

\`\`\`python
# 错误：没有限制，一次返回所有数据
@strawberry.field
def users(self) -> List[User]:
    return User.query.all()  # 可能上百万条！

# 正确：强制分页
@strawberry.field
def users(self, first: int = 20, after: Optional[str] = None) -> UserConnection:
    first = min(first, 100)  # 限制最大数量
    return paginate_users(first, after)
\`\`\`
`
  },
  {
    id: "pyb-14-6",
    group: "API设计（REST/GraphQL/gRPC）",
    icon: "🔌",
    title: "GraphQL实战",
    content: `

# GraphQL实战

## 一、嵌套查询解析

### 1.1 嵌套查询执行原理

GraphQL查询解析器在执行时，每个字段都会调用对应的resolver函数。嵌套查询时会按层级依次调用：

\`\`\`graphql
query {
  user(id: 1) {
    username
    articles {
      title
      comments {
        content
        author {
          username
        }
      }
    }
  }
}
\`\`\`

执行顺序：
1. 调用Query.user resolver → 返回user对象
2. 调用User.username resolver → 返回用户名
3. 调用User.articles resolver → 返回文章列表
4. 对每篇article调用Article.comments resolver
5. 对每个comment调用Comment.author resolver
6. 对每个author调用User.username resolver

### 1.2 Resolver性能优化

\`\`\`python
import strawberry
from typing import List, Optional

@strawberry.type
class Comment:
    id: strawberry.ID
    content: str
    author_id: strawberry.ID

    @strawberry.field
    async def author(self, info) -> "User":
        # 这里会产生N+1问题，需要DataLoader
        return await info.context["user_loader"].load(self.author_id)

@strawberry.type
class Article:
    id: strawberry.ID
    title: str
    content: str
    author_id: strawberry.ID

    @strawberry.field
    async def comments(self, info) -> List[Comment]:
        # 批量加载评论
        return await info.context["comment_loader"].load(self.id)

    @strawberry.field
    async def author(self, info) -> "User":
        return await info.context["user_loader"].load(self.author_id)

@strawberry.type
class User:
    id: strawberry.ID
    username: str
    email: str

    @strawberry.field
    async def articles(self, info) -> List[Article]:
        return await info.context["article_loader"].load(self.id)

# DataLoader实现
from aiodataloader import DataLoader

class UserLoader(DataLoader):
    async def batch_load_fn(self, user_ids):
        users = await db.fetch_all(
            "SELECT id, username, email FROM users WHERE id = ANY($1)",
            [list(map(int, user_ids))]
        )
        user_map = {str(u.id): u for u in users}
        return [user_map.get(uid) for uid in user_ids]

class ArticleLoader(DataLoader):
    async def batch_load_fn(self, author_ids):
        articles = await db.fetch_all(
            "SELECT id, title, content, author_id FROM articles WHERE author_id = ANY($1)",
            [list(map(int, author_ids))]
        )
        article_map = {}
        for a in articles:
            aid = str(a.author_id)
            if aid not in article_map:
                article_map[aid] = []
            article_map[aid].append(a)
        return [article_map.get(aid, []) for aid in author_ids]

class CommentLoader(DataLoader):
    async def batch_load_fn(self, article_ids):
        comments = await db.fetch_all(
            "SELECT id, content, author_id, article_id FROM comments WHERE article_id = ANY($1)",
            [list(map(int, article_ids))]
        )
        comment_map = {}
        for c in comments:
            aid = str(c.article_id)
            if aid not in comment_map:
                comment_map[aid] = []
            comment_map[aid].append(c)
        return [comment_map.get(aid, []) for aid in article_ids]
\`\`\`

---

## 二、N+1问题解决方案

### 2.1 识别N+1问题

\`\`\`python
# N+1问题演示
# 查询10个用户，每个用户5篇文章，每篇文章10条评论
# User: 1次查询
# Articles: 10次查询（每个用户一次）
# Comments: 50次查询（每篇文章一次）
# 总共: 1+10+50 = 61次查询！

# 不使用DataLoader的错误做法
@strawberry.field
async def articles(self, info) -> List[Article]:
    # 每个用户单独查一次
    articles = await db.fetch_all(
        "SELECT * FROM articles WHERE author_id = $1",
        int(self.id)
    )
    return articles
\`\`\`

### 2.2 批量加载优化

使用DataLoader后，相同的批量请求会被合并：

\`\`\`python
from urllib.request import Request
# 使用DataLoader后
# User: 1次查询
# Articles: 1次批量查询（所有用户ID一起查）
# Comments: 1次批量查询（所有文章ID一起查）
# 总共: 1+1+1 = 3次查询！

# 上下文初始化
async def get_context(request: Request):
    return {
        "request": request,
        "user_loader": UserLoader(),
        "article_loader": ArticleLoader(),
        "comment_loader": CommentLoader(),
    }
\`\`\`

### 2.3 预加载（Eager Loading）

对于确定会加载的关联，可以一次性JOIN查询：

\`\`\`python
@strawberry.type
class Query:
    @strawberry.field
    async def user_with_articles(self, info, id: strawberry.ID) -> Optional[User]:
        # 使用JOIN一次性加载用户和文章
        rows = await db.fetch_all(
            """
            SELECT u.id, u.username, u.email,
                   a.id as article_id, a.title, a.content
            FROM users u
            LEFT JOIN articles a ON u.id = a.author_id
            WHERE u.id = $1
            """,
            int(id)
        )
        if not rows:
            return None

        # 组装数据
        user = User(id=rows[0].id, username=rows[0].username, email=rows[0].email)
        articles = []
        for row in rows:
            if row.article_id:
                articles.append(Article(
                    id=row.article_id,
                    title=row.title,
                    content=row.content,
                    author_id=user.id
                ))

        # 缓存到DataLoader中，避免重复查询
        article_loader = info.context["article_loader"]
        article_loader.prime(str(user.id), articles)

        return user
\`\`\`

---

## 三、分页（Relay Connection）

### 3.1 Relay Connection规范

Relay风格的游标分页是GraphQL推荐的标准分页方式：

\`\`\`python
import base64
import strawberry
from typing import List, Optional, Generic, TypeVar

GenericType = TypeVar("GenericType")

@strawberry.type
class PageInfo:
    has_next_page: bool
    has_previous_page: bool
    start_cursor: Optional[str] = None
    end_cursor: Optional[str] = None

@strawberry.type
class Edge(Generic[GenericType]):
    node: GenericType
    cursor: str

@strawberry.type
class Connection(Generic[GenericType]):
    edges: List[Edge[GenericType]]
    page_info: PageInfo
    total_count: int

def cursor_from_id(id: int) -> str:
    return base64.b64encode(f"cursor:{id}".encode()).decode()

def id_from_cursor(cursor: str) -> int:
    decoded = base64.b64decode(cursor.encode()).decode()
    return int(decoded.split(":")[1])

@strawberry.type
class Article:
    id: strawberry.ID
    title: str
    content: str
    created_at: datetime

@strawberry.type
class Query:
    @strawberry.field
    async def articles(
        self,
        info,
        first: Optional[int] = 20,
        after: Optional[str] = None,
        last: Optional[int] = None,
        before: Optional[str] = None,
    ) -> Connection[Article]:
        first = min(first or 20, 100)  # 限制最大数量

        # 构建查询
        query = "SELECT id, title, content, created_at FROM articles"
        params = []
        conditions = []

        if after:
            after_id = id_from_cursor(after)
            conditions.append("id > $1")
            params.append(after_id)

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY id ASC LIMIT $" + str(len(params) + 1)
        params.append(first + 1)  # 多取一条判断是否有下一页

        rows = await db.fetch_all(query, *params)

        has_next_page = len(rows) > first
        rows = rows[:first]

        edges = []
        for row in rows:
            article = Article(
                id=strawberry.ID(str(row.id)),
                title=row.title,
                content=row.content,
                created_at=row.created_at
            )
            edges.append(Edge(
                node=article,
                cursor=cursor_from_id(row.id)
            ))

        total_count = await db.fetch_val("SELECT COUNT(*) FROM articles")

        return Connection(
            edges=edges,
            page_info=PageInfo(
                has_next_page=has_next_page,
                has_previous_page=after is not None,
                start_cursor=edges[0].cursor if edges else None,
                end_cursor=edges[-1].cursor if edges else None
            ),
            total_count=total_count
        )
\`\`\`

查询示例：
\`\`\`graphql
query {
  articles(first: 10) {
    totalCount
    edges {
      node {
        id
        title
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
\`\`\`

---

## 四、订阅Subscription

### 4.1 WebSocket订阅

\`\`\`python
import asyncio
import strawberry
from typing import AsyncGenerator
from datetime import datetime

@strawberry.type
class Subscription:
    @strawberry.subscription
    async def count(self, target: int = 10) -> AsyncGenerator[int, None]:
        """简单的计数订阅示例"""
        for i in range(target):
            yield i
            await asyncio.sleep(1)

    @strawberry.subscription
    async def new_message(self, room_id: str) -> AsyncGenerator["Message", None]:
        """聊天室新消息订阅"""
        pubsub = info.context["pubsub"]
        async for message in pubsub.subscribe(f"room:{room_id}"):
            yield message

@strawberry.type
class Message:
    id: strawberry.ID
    content: str
    sender: str
    room_id: str
    created_at: datetime

# Pub/Sub实现
import aioredis

class PubSub:
    def __init__(self, redis_url: str = "redis://localhost"):
        self.redis = None
        self.pubsub = None

    async def connect(self):
        self.redis = await aioredis.from_url(redis_url)
        self.pubsub = self.redis.pubsub()

    async def subscribe(self, channel: str) -> AsyncGenerator:
        await self.pubsub.subscribe(channel)
        async for message in self.pubsub.listen():
            if message["type"] == "message":
                yield json.loads(message["data"])

    async def publish(self, channel: str, data: dict):
        await self.redis.publish(channel, json.dumps(data))

# FastAPI集成
from strawberry.fastapi import GraphQLRouter
from strawberry.subscriptions import GRAPHQL_TRANSPORT_WS_PROTOCOL, GRAPHQL_WS_PROTOCOL

async def get_context():
    if not hasattr(app.state, "pubsub"):
        app.state.pubsub = PubSub()
        await app.state.pubsub.connect()
    return {"pubsub": app.state.pubsub}

schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    subscription=Subscription
)

graphql_router = GraphQLRouter(
    schema,
    context_getter=get_context,
    subscription_protocols=[
        GRAPHQL_TRANSPORT_WS_PROTOCOL,
        GRAPHQL_WS_PROTOCOL,
    ]
)
\`\`\`

---

## 五、错误处理与鉴权

### 5.1 错误处理

\`\`\`python
from strawberry.types import Info
from graphql import GraphQLError

class AuthenticationError(GraphQLError):
    def __init__(self, message: str = "未认证"):
        super().__init__(
            message=message,
            extensions={"code": "UNAUTHENTICATED"}
        )

class ForbiddenError(GraphQLError):
    def __init__(self, message: str = "无权限"):
        super().__init__(
            message=message,
            extensions={"code": "FORBIDDEN"}
        )

class NotFoundError(GraphQLError):
    def __init__(self, resource: str, id: str):
        super().__init__(
            message=f"{resource}不存在: {id}",
            extensions={"code": "NOT_FOUND", "resource": resource, "id": id}
        )

class ValidationError(GraphQLError):
    def __init__(self, field: str, message: str):
        super().__init__(
            message=f"验证失败: {message}",
            extensions={"code": "VALIDATION_ERROR", "field": field}
        )

@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_article(
        self,
        info: Info,
        title: str,
        content: str
    ) -> Article:
        user = info.context.get("user")
        if not user:
            raise AuthenticationError()

        if len(title) < 3:
            raise ValidationError("title", "标题至少3个字符")

        if len(title) > 200:
            raise ValidationError("title", "标题最多200个字符")

        try:
            article = await create_article_in_db(
                title=title,
                content=content,
                author_id=user.id
            )
            return article
        except Exception as e:
            raise GraphQLError(
                message="创建文章失败",
                extensions={"code": "INTERNAL_ERROR"}
            )
\`\`\`

### 5.2 全局错误格式化

\`\`\`python
from strawberry.fastapi import GraphQLRouter
from starlette.requests import Request
from starlette.responses import JSONResponse

class CustomGraphQLRouter(GraphQLRouter):
    async def process_result(self, request: Request, result):
        # 自定义错误格式
        if result.errors:
            formatted_errors = []
            for error in result.errors:
                formatted_error = {
                    "message": error.message,
                    "locations": [{"line": loc.line, "column": loc.column} for loc in error.locations] if error.locations else None,
                    "path": error.path,
                    "extensions": error.extensions or {}
                }
                formatted_errors.append(formatted_error)

            return JSONResponse(
                status_code=200,
                content={
                    "data": result.data,
                    "errors": formatted_errors
                }
            )
        return await super().process_result(request, result)
\`\`\`

### 5.3 鉴权实现

\`\`\`python
from strawberry.permission import BasePermission
from typing import Any

class IsAuthenticated(BasePermission):
    message = "请先登录"

    def has_permission(self, source: Any, info: Info, **kwargs) -> bool:
        user = info.context.get("user")
        return user is not None

class HasRole(BasePermission):
    message = "权限不足"

    def __init__(self, roles: list):
        self.roles = roles

    def has_permission(self, source: Any, info: Info, **kwargs) -> bool:
        user = info.context.get("user")
        if not user:
            return False
        return user.role in self.roles

# 字段级别鉴权
@strawberry.type
class Query:
    @strawberry.field(permission_classes=[IsAuthenticated])
    def me(self, info: Info) -> User:
        return info.context["user"]

    @strawberry.field(permission_classes=[HasRole(["admin"])])
    def admin_dashboard(self, info: Info) -> AdminStats:
        return get_admin_stats()

# 全局鉴权 - 在上下文中处理
async def get_context(request: Request):
    auth_header = request.headers.get("Authorization", "")
    user = None
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
        try:
            user = await verify_token(token)
        except:
            user = None
    return {"request": request, "user": user}
\`\`\`

---

## 六、最佳实践与常见坑点

### 6.1 GraphQL实战最佳实践

1. **使用DataLoader**：所有关联查询都通过DataLoader
2. **分页使用Connection**：不要使用offset/limit，使用Relay Connection
3. **输入验证**：在Mutation中进行完整的输入验证
4. **错误码规范**：统一错误码格式，便于客户端处理
5. **查询深度限制**：防止恶意嵌套查询
6. **复杂度计算**：限制查询复杂度，保护服务器
7. **持久化查询**：生产环境使用Persisted Queries
8. **监控日志**：记录慢查询和错误

\`\`\`python
# 查询深度限制
def calculate_depth(node, depth=0):
    if not hasattr(node, "selection_set") or not node.selection_set:
        return depth
    max_depth = depth
    for selection in node.selection_set.selections:
        child_depth = calculate_depth(selection, depth + 1)
        max_depth = max(max_depth, child_depth)
    return max_depth

MAX_QUERY_DEPTH = 10

@strawberry.type
class Query:
    @strawberry.field
    async def protected_query(self, info: Info):
        from graphql import parse
        doc = parse(info.context["query"])
        depth = calculate_depth(doc.definitions[0])
        if depth > MAX_QUERY_DEPTH:
            raise GraphQLError(f"查询深度超出限制: {depth} > {MAX_QUERY_DEPTH}")
        # ...业务逻辑
\`\`\`

### 6.2 常见坑点

**坑点1：Mutation返回部分数据**

\`\`\`python
# 错误：部分成功部分失败
@strawberry.mutation
async def bulk_create_users(self, users: List[CreateUserInput]) -> List[User]:
    results = []
    for user_input in users:
        try:
            results.append(create_user(user_input))
        except:
            pass  # 静默失败，客户端不知道哪个失败了
    return results

# 正确：返回详细结果
@strawberry.type
class BulkCreateResult:
    success: bool
    user: Optional[User]
    error: Optional[str]

@strawberry.mutation
async def bulk_create_users(self, users: List[CreateUserInput]) -> List[BulkCreateResult]:
    results = []
    for user_input in users:
        try:
            user = create_user(user_input)
            results.append(BulkCreateResult(success=True, user=user, error=None))
        except Exception as e:
            results.append(BulkCreateResult(success=False, user=None, error=str(e)))
    return results
\`\`\`

**坑点2：Subscription内存泄漏**

\`\`\`python
# 错误：不清理订阅连接
# 正确：使用Redis Pub/Sub，连接断开自动清理
# 并设置订阅超时
@strawberry.subscription
async def stream(self) -> AsyncGenerator:
    try:
        while True:
            data = await queue.get()
            yield data
    finally:
        # 清理资源
        await queue.close()
\`\`\`
`
  },
  {
    id: "pyb-14-7",
    group: "API设计（REST/GraphQL/gRPC）",
    icon: "🔌",
    title: "gRPC与Protobuf",
    content: `

# gRPC与Protobuf

## 一、Protocol Buffers语法

### 1.1 Protobuf简介

Protocol Buffers（Protobuf）是Google开发的二进制序列化格式，具有以下优势：

| 特性 | JSON | XML | Protobuf |
|------|------|-----|----------|
| 体积 | 大 | 很大 | 小（3-10倍） |
| 序列化速度 | 中 | 慢 | 快（20-100倍） |
| 反序列化速度 | 中 | 慢 | 快 |
| 可读性 | 好 | 好 | 二进制不可读 |
| 类型安全 | 弱 | 弱 | 强类型 |
| Schema演进 | 需要兼容 | 需要兼容 | 内置支持 |

### 1.2 基础语法

\`\`\`protobuf
// 使用proto3语法
syntax = "proto3";

// 包名，用于避免命名冲突
package user;

// 导入其他proto文件
import "google/protobuf/timestamp.proto";
import "google/protobuf/empty.proto";

// 选项配置
option java_multiple_files = true;
option java_package = "com.example.user";
option go_package = "github.com/example/user";

// 枚举类型
enum UserRole {
  USER_ROLE_UNSPECIFIED = 0;  // 第一个必须是0
  ADMIN = 1;
  EDITOR = 2;
  VIEWER = 3;
}

enum UserStatus {
  USER_STATUS_UNSPECIFIED = 0;
  ACTIVE = 1;
  INACTIVE = 2;
  BANNED = 3;
}

// 用户消息定义
message User {
  int64 id = 1;                    // 字段编号
  string username = 2;
  string email = 3;
  UserRole role = 4;
  UserStatus status = 5;
  google.protobuf.Timestamp created_at = 6;
  google.protobuf.Timestamp updated_at = 7;
  repeated string tags = 8;        // repeated = 数组/列表
  map<string, string> metadata = 9; // map类型
  Profile profile = 10;            // 嵌套消息
  oneof contact {                  // oneof：多个字段只能选一个
    string phone = 11;
    string wechat = 12;
  }
  reserved 13, 14;                 // 保留字段号，不能再用
  reserved "old_field";            // 保留字段名
}

// Profile嵌套消息
message Profile {
  string bio = 1;
  string avatar = 2;
  string website = 3;
  int32 age = 4;
}

// 创建用户请求
message CreateUserRequest {
  string username = 1;
  string email = 2;
  string password = 3;
  UserRole role = 4;
}

// 用户列表请求
message ListUsersRequest {
  int32 page = 1;
  int32 page_size = 2;
  string keyword = 3;
  UserRole role = 4;
  UserStatus status = 5;
}

// 用户列表响应
message ListUsersResponse {
  repeated User users = 1;
  int32 total = 2;
  int32 page = 3;
  int32 page_size = 4;
}

// 获取用户请求
message GetUserRequest {
  int64 id = 1;
}

// 删除用户响应
message DeleteUserResponse {
  bool success = 1;
}
\`\`\`

### 1.3 字段类型

| Protobuf类型 | Python类型 | 说明 |
|-------------|-----------|------|
| double | float | 64位浮点数 |
| float | float | 32位浮点数 |
| int32 | int | 32位整数 |
| int64 | int | 64位整数 |
| uint32 | int | 无符号32位 |
| uint64 | int | 无符号64位 |
| sint32 | int | 有符号32位（负数更高效） |
| sint64 | int | 有符号64位 |
| bool | bool | 布尔值 |
| string | str | UTF-8字符串 |
| bytes | bytes | 二进制数据 |
| enum | Enum | 枚举类型 |
| message | object | 嵌套消息 |
| repeated | list | 数组/列表 |
| map | dict | 键值对 |

---

## 二、gRPC服务定义

### 2.1 服务定义

\`\`\`protobuf
syntax = "proto3";

package user;

import "google/protobuf/empty.proto";

// 用户服务定义
service UserService {
  // 一元RPC：获取用户
  rpc GetUser(GetUserRequest) returns (User);

  // 创建用户
  rpc CreateUser(CreateUserRequest) returns (User);

  // 更新用户
  rpc UpdateUser(UpdateUserRequest) returns (User);

  // 删除用户
  rpc DeleteUser(DeleteUserRequest) returns (DeleteUserResponse);

  // 服务端流式RPC：获取用户列表（流式返回）
  rpc ListUsersStream(ListUsersRequest) returns (stream User);

  // 客户端流式RPC：批量创建用户（客户端流式发送）
  rpc BatchCreateUsers(stream CreateUserRequest) returns (BatchCreateResponse);

  // 双向流式RPC：实时聊天
  rpc Chat(stream ChatMessage) returns (stream ChatMessage);
}

service ArticleService {
  rpc GetArticle(GetArticleRequest) returns (Article);
  rpc CreateArticle(CreateArticleRequest) returns (Article);
  rpc ListArticles(ListArticlesRequest) returns (ListArticlesResponse);
}

message UpdateUserRequest {
  int64 id = 1;
  string username = 2;
  string email = 3;
  UserRole role = 4;
}

message DeleteUserRequest {
  int64 id = 1;
}

message BatchCreateResponse {
  repeated int64 ids = 1;
  int32 success_count = 2;
  repeated string errors = 3;
}

message ChatMessage {
  int64 id = 1;
  int64 user_id = 2;
  string content = 3;
  google.protobuf.Timestamp sent_at = 4;
}
\`\`\`

### 2.2 四种通信模式

| 模式 | 客户端 | 服务端 | 适用场景 |
|------|--------|--------|---------|
| Unary（一元） | 1请求 | 1响应 | 普通API调用 |
| Server Streaming | 1请求 | 流式响应 | 数据推送、列表流式传输 |
| Client Streaming | 流式请求 | 1响应 | 批量上传、数据收集 |
| Bidirectional Streaming | 双向流 | 双向流 | 实时聊天、双向通信 |

---

## 三、grpcio库使用

### 3.1 安装与代码生成

\`\`\`bash
# 安装依赖
pip install grpcio grpcio-tools protobuf

# 生成Python代码
python -m grpc_tools.protoc \\
  -I./protos \\
  --python_out=./generated \\
  --grpc_python_out=./generated \\
  ./protos/user.proto
\`\`\`

生成的文件：
- \`user_pb2.py\`：消息类
- \`user_pb2_grpc.py\`：服务端/客户端桩代码

### 3.2 服务端实现

\`\`\`python
import grpc
from concurrent import futures
import time
from generated import user_pb2, user_pb2_grpc

class UserServiceServicer(user_pb2_grpc.UserServiceServicer):
    def __init__(self):
        self.users = {}
        self.next_id = 1

    def GetUser(self, request, context):
        """一元RPC：获取单个用户"""
        user = self.users.get(request.id)
        if not user:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details(f"用户 {request.id} 不存在")
            return user_pb2.User()
        return user

    def CreateUser(self, request, context):
        """一元RPC：创建用户"""
        user = user_pb2.User(
            id=self.next_id,
            username=request.username,
            email=request.email,
            role=request.role,
            status=user_pb2.ACTIVE,
        )
        self.users[self.next_id] = user
        self.next_id += 1
        return user

    def ListUsersStream(self, request, context):
        """服务端流式：逐个返回用户"""
        count = 0
        for user in self.users.values():
            if request.role and user.role != request.role:
                continue
            yield user
            count += 1
            if request.page_size and count >= request.page_size:
                break

    def BatchCreateUsers(self, request_iterator, context):
        """客户端流式：批量创建用户"""
        ids = []
        errors = []
        success_count = 0

        for request in request_iterator:
            try:
                user = user_pb2.User(
                    id=self.next_id,
                    username=request.username,
                    email=request.email,
                    role=request.role,
                )
                self.users[self.next_id] = user
                ids.append(self.next_id)
                self.next_id += 1
                success_count += 1
            except Exception as e:
                errors.append(str(e))

        return user_pb2.BatchCreateResponse(
            ids=ids,
            success_count=success_count,
            errors=errors
        )

    def Chat(self, request_iterator, context):
        """双向流式：聊天"""
        for message in request_iterator:
            # 简单广播：返回收到的消息
            yield user_pb2.ChatMessage(
                id=int(time.time() * 1000),
                user_id=message.user_id,
                content=f"收到: {message.content}",
                sent_at=timestamp_pb2.Timestamp().GetCurrentTime()
            )

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    user_pb2_grpc.add_UserServiceServicer_to_server(
        UserServiceServicer(), server
    )
    server.add_insecure_port("[::]:50051")
    server.start()
    print("gRPC server started on port 50051")
    server.wait_for_termination()

if __name__ == "__main__":
    serve()
\`\`\`

### 3.3 客户端调用

\`\`\`python
import grpc
from generated import user_pb2, user_pb2_grpc

def run():
    # 创建通道
    with grpc.insecure_channel("localhost:50051") as channel:
        # 创建客户端桩
        stub = user_pb2_grpc.UserServiceStub(channel)

        # 一元调用：创建用户
        response = stub.CreateUser(user_pb2.CreateUserRequest(
            username="zhangsan",
            email="z***@example.com",
            role=user_pb2.VIEWER
        ))
        print(f"创建用户: {response}")

        # 一元调用：获取用户
        user = stub.GetUser(user_pb2.GetUserRequest(id=1))
        print(f"获取用户: {user}")

        # 服务端流式调用
        print("\n流式获取用户:")
        for user in stub.ListUsersStream(user_pb2.ListUsersRequest(page_size=10)):
            print(f"  {user.username}")

        # 客户端流式调用
        def generate_requests():
            for i in range(5):
                yield user_pb2.CreateUserRequest(
                    username=f"user{i}",
                    email=f"user{i}@example.com"
                )
        result = stub.BatchCreateUsers(generate_requests())
        print(f"\n批量创建: 成功{result.success_count}个")

        # 双向流式调用
        def generate_messages():
            for i in range(3):
                yield user_pb2.ChatMessage(
                    user_id=1,
                    content=f"消息{i}"
                )
        print("\n聊天:")
        for response in stub.Chat(generate_messages()):
            print(f"  收到: {response.content}")

if __name__ == "__main__":
    run()
\`\`\`

---

## 四、TLS认证

### 4.1 服务端TLS

\`\`\`python
# 生成证书：
# openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes

def serve_tls():
    # 读取证书
    with open("server.key", "rb") as f:
        private_key = f.read()
    with open("server.crt", "rb") as f:
        certificate_chain = f.read()

    server_credentials = grpc.ssl_server_credentials(
        [(private_key, certificate_chain)]
    )

    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    user_pb2_grpc.add_UserServiceServicer_to_server(
        UserServiceServicer(), server
    )
    server.add_secure_port("[::]:50051", server_credentials)
    server.start()
    server.wait_for_termination()
\`\`\`

### 4.2 客户端TLS

\`\`\`python
def run_tls():
    # 读取CA证书
    with open("server.crt", "rb") as f:
        trusted_certs = f.read()

    credentials = grpc.ssl_channel_credentials(
        root_certificates=trusted_certs
    )

    with grpc.secure_channel("localhost:50051", credentials) as channel:
        stub = user_pb2_grpc.UserServiceStub(channel)
        response = stub.GetUser(user_pb2.GetUserRequest(id=1))
        print(response)
\`\`\`

### 4.3 Token认证

\`\`\`python
# 服务端拦截器
class AuthInterceptor(grpc.ServerInterceptor):
    def intercept_service(self, continuation, handler_call_details):
        metadata = dict(handler_call_details.invocation_metadata)
        token = metadata.get("authorization", "")

        if not token.startswith("Bearer "):
            return self._unary_unary_unauthenticated()

        token = token[7:]
        try:
            user = verify_jwt_token(token)
            # 将用户信息存入context
            return continuation(handler_call_details)
        except:
            return self._unary_unary_unauthenticated()

    def _unary_unary_unauthenticated(self):
        def abort(request, context):
            context.set_code(grpc.StatusCode.UNAUTHENTICATED)
            context.set_details("无效的Token")
            return user_pb2.User()
        return grpc.unary_unary_rpc_method_handler(abort)

# 服务端使用拦截器
server = grpc.server(
    futures.ThreadPoolExecutor(max_workers=10),
    interceptors=[AuthInterceptor()]
)

# 客户端添加Token
class AuthGateway(grpc.AuthMetadataPlugin):
    def __call__(self, context, callback):
        callback((("authorization", f"Bearer {get_token()}"),), None)

def run_with_auth():
    auth_creds = grpc.metadata_call_credentials(AuthGateway())
    channel_creds = grpc.ssl_channel_credentials()
    composite_creds = grpc.composite_channel_credentials(channel_creds, auth_creds)

    with grpc.secure_channel("localhost:50051", composite_creds) as channel:
        stub = user_pb2_grpc.UserServiceStub(channel)
        response = stub.GetUser(user_pb2.GetUserRequest(id=1))
\`\`\`

---

## 五、最佳实践与常见坑点

### 5.1 gRPC最佳实践

1. **版本化Protobuf**：使用package版本控制（package v1.user）
2. **正确的错误码**：使用标准的gRPC状态码
3. **设置超时**：所有调用都设置deadline/timeout
4. **拦截器**：使用拦截器处理日志、认证、监控
5. **流式处理**：大数据集使用流式传输
6. **TLS加密**：生产环境必须使用TLS
7. **健康检查**：实现gRPC健康检查协议
8. **错误详情**：使用google.rpc.Status传递详细错误

\`\`\`python
# 超时设置
try:
    response = stub.GetUser(
        user_pb2.GetUserRequest(id=1),
        timeout=5.0  # 5秒超时
    )
except grpc.RpcError as e:
    if e.code() == grpc.StatusCode.DEADLINE_EXCEEDED:
        print("请求超时")
\`\`\`

### 5.2 常见坑点

**坑点1：消息字段删除后重新使用**

\`\`\`protobuf
// 错误：删除字段2后又用2定义新字段
message User {
  int64 id = 1;
  string username = 2;  // 后来删除了
  // ... 后来又加回来
  int32 new_field = 2;  // 危险！旧客户端会解析错误
}

// 正确：使用reserved保留字段
message User {
  int64 id = 1;
  reserved 2;
  reserved "username";
  string new_field = 3;  // 使用新字段号
}
\`\`\`

**坑点2：默认值陷阱**

\`\`\`python
# proto3中，默认值不会被序列化
# bool默认为false，int默认为0，string默认为""
# 无法区分"设置为0"和"未设置"

# 解决方案：使用wrapper类型
import google.protobuf.wrappers_pb2 as wrappers

message User {
  int64 id = 1;
  google.protobuf.Int32Value age = 2;  # 可以区分null和0
  google.protobuf.BoolValue is_active = 3;
}
\`\`\`
`
  },
  {
    id: "pyb-14-8",
    group: "API设计（REST/GraphQL/gRPC）",
    icon: "🔌",
    title: "API网关与统一接入",
    content: `

# API网关与统一接入

## 一、API网关作用

### 1.1 API网关核心功能

| 功能 | 说明 |
|------|------|
| 路由转发 | 将请求路由到对应的后端服务 |
| 认证授权 | 统一处理JWT/OAuth2认证 |
| 限流熔断 | 防止服务被流量打垮 |
| 负载均衡 | 在多个后端实例间分发流量 |
| 监控日志 | 统一收集请求日志、指标 |
| 请求转换 | 修改请求/响应、协议转换 |
| 缓存 | 缓存热点请求，减轻后端压力 |
| 灰度发布 | 按比例/规则切分流量 |

### 1.2 网关架构位置

\`\`\`
客户端 → CDN → WAF → 负载均衡 → API网关 → 微服务集群
                                             ↓
                                  ┌──────────┼──────────┐
                                  ↓          ↓          ↓
                              用户服务    订单服务    商品服务
\`\`\`

---

## 二、Kong/APISIX配置

### 2.1 Kong网关基础

\`\`\`bash
# 使用Docker启动Kong
docker run -d --name kong \\
  -e "KONG_DATABASE=postgres" \\
  -e "KONG_PG_HOST=db" \\
  -e "KONG_PROXY_ACCESS_LOG=/dev/stdout" \\
  -e "KONG_ADMIN_ACCESS_LOG=/dev/stdout" \\
  -e "KONG_PROXY_ERROR_LOG=/dev/stderr" \\
  -e "KONG_ADMIN_ERROR_LOG=/dev/stderr" \\
  -e "KONG_ADMIN_LISTEN=0.0.0.0:8001" \\
  -p 8000:8000 \\
  -p 8443:8443 \\
  -p 8001:8001 \\
  kong/kong-gateway:latest
\`\`\`

\`\`\`bash
# 添加服务
curl -i -X POST http://localhost:8001/services/ \\
  --data "name=user-service" \\
  --data "url=http://user-service:8000"

# 添加路由
curl -i -X POST http://localhost:8001/services/user-service/routes \\
  --data "paths[]=/api/users" \\
  --data "strip_path=true"

# 添加JWT插件
curl -i -X POST http://localhost:8001/services/user-service/plugins/ \\
  --data "name=jwt"

# 添加限流插件
curl -i -X POST http://localhost:8001/services/user-service/plugins/ \\
  --data "name=rate-limiting" \\
  --data "config.minute=100" \\
  --data "config.policy=local"
\`\`\`

### 2.2 APISIX配置

\`\`\`bash
# APISIX使用etcd作为存储
# 添加上游
curl http://127.0.0.1:9080/apisix/admin/upstreams/1 -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1' -X PUT -d '
{
  "type": "roundrobin",
  "nodes": {
    "user-service:8000": 1,
    "user-service-2:8000": 1
  }
}'

# 添加路由
curl http://127.0.0.1:9080/apisix/admin/routes/1 -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1' -X PUT -d '
{
  "uri": "/api/users/*",
  "upstream_id": 1,
  "plugins": {
    "jwt-auth": {},
    "limit-count": {
      "count": 100,
      "time_window": 60,
      "rejected_code": 429
    },
    "cors": {},
    "proxy-rewrite": {
      "regex_uri": ["^/api/users/(.*)", "/$1"]
    }
  }
}'

# 消费者（JWT认证）
curl http://127.0.0.1:9080/apisix/admin/consumers -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1' -X PUT -d '
{
  "username": "app_user",
  "plugins": {
    "jwt-auth": {
      "key": "user-key",
      "secret": "your-secret-key"
    }
  }
}'
\`\`\`

---

## 三、Python实现简单网关

### 3.1 基于FastAPI的反向代理网关

\`\`\`python
from fastapi import FastAPI, Request, Response, HTTPException, Depends
from fastapi.responses import JSONResponse, StreamingResponse
import httpx
import time
from typing import Optional
from collections import defaultdict
import asyncio

app = FastAPI(title="API Gateway")

# 服务路由表
SERVICE_ROUTES = {
    "user": "http://user-service:8000",
    "article": "http://article-service:8001",
    "order": "http://order-service:8002",
}

# 简单内存限流
rate_limits = defaultdict(list)
RATE_LIMIT = 100  # 每分钟100次
RATE_WINDOW = 60

# HTTP客户端
client = httpx.AsyncClient(timeout=30.0)

# 限流中间件
async def rate_limit(request: Request):
    client_ip = request.client.host
    now = time.time()

    # 清理过期记录
    rate_limits[client_ip] = [
        t for t in rate_limits[client_ip]
        if now - t < RATE_WINDOW
    ]

    if len(rate_limits[client_ip]) >= RATE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail="请求过于频繁，请稍后再试"
        )

    rate_limits[client_ip].append(now)
    return True

# JWT认证
async def authenticate(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="未提供认证Token")

    token = auth_header[7:]
    try:
        payload = verify_jwt_token(token)
        request.state.user = payload
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token无效: {str(e)}")

# 不需要认证的路径
PUBLIC_PATHS = [
    "/api/user/auth/login",
    "/api/user/auth/register",
    "/api/article/list",
]

@app.api_route("/api/{service}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def gateway(
    service: str,
    path: str,
    request: Request,
    _: bool = Depends(rate_limit)
):
    # 检查服务是否存在
    if service not in SERVICE_ROUTES:
        raise HTTPException(status_code=404, detail=f"服务不存在: {service}")

    # 认证检查
    full_path = f"/api/{service}/{path}"
    if not any(full_path.startswith(p) for p in PUBLIC_PATHS):
        await authenticate(request)

    # 构建目标URL
    target_url = f"{SERVICE_ROUTES[service]}/{path}"

    # 读取请求体
    body = await request.body()

    # 转发请求头（移除hop-by-hop头）
    headers = dict(request.headers)
    headers.pop("host", None)
    headers.pop("connection", None)

    # 添加请求ID
    request_id = f"req_{int(time.time() * 1000)}"
    headers["X-Request-ID"] = request_id

    # 转发请求
    start_time = time.time()
    try:
        response = await client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            content=body,
            params=request.query_params,
        )

        # 记录访问日志
        process_time = time.time() - start_time
        print(
            f"[{request_id}] {request.method} {full_path} -> {response.status_code} "
            f"{response.headers.get('content-length', 0)} bytes {process_time:.3f}s"
        )

        # 构建响应
        excluded_headers = {"content-encoding", "transfer-encoding", "connection"}
        response_headers = {
            k: v for k, v in response.headers.items()
            if k.lower() not in excluded_headers
        }
        response_headers["X-Request-ID"] = request_id
        response_headers["X-Process-Time"] = f"{process_time:.3f}"

        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=response_headers,
            media_type=response.headers.get("content-type")
        )

    except httpx.TimeoutException:
        return JSONResponse(
            status_code=504,
            content={"error": "服务超时", "request_id": request_id}
        )
    except httpx.ConnectError:
        return JSONResponse(
            status_code=503,
            content={"error": "服务不可用", "request_id": request_id}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"网关错误: {str(e)}", "request_id": request_id}
        )

@app.on_event("shutdown")
async def shutdown():
    await client.aclose()
\`\`\`

### 3.2 协议转换（REST转gRPC）

\`\`\`python
import grpc
from generated import user_pb2, user_pb2_grpc

# gRPC客户端
channel = grpc.insecure_channel("user-service:50051")
user_stub = user_pb2_grpc.UserServiceStub(channel)

@app.get("/api/users/{user_id}")
async def get_user_rest(user_id: int):
    """REST API转gRPC调用"""
    try:
        grpc_response = user_stub.GetUser(
            user_pb2.GetUserRequest(id=user_id),
            timeout=5.0
        )
        return {
            "id": grpc_response.id,
            "username": grpc_response.username,
            "email": grpc_response.email,
            "role": user_pb2.UserRole.Name(grpc_response.role),
        }
    except grpc.RpcError as e:
        status_map = {
            grpc.StatusCode.NOT_FOUND: 404,
            grpc.StatusCode.PERMISSION_DENIED: 403,
            grpc.StatusCode.UNAUTHENTICATED: 401,
        }
        status_code = status_map.get(e.code(), 500)
        raise HTTPException(status_code=status_code, detail=e.details())
\`\`\`

---

## 四、接口聚合BFF模式

### 4.1 BFF（Backend For Frontend）概念

BFF是为特定前端/客户端定制的聚合层：

\`\`\`
移动端BFF → 移动端优化的API聚合
PC端BFF  → PC端优化的API聚合
小程序BFF → 小程序优化的API聚合
\`\`\`

### 4.2 BFF实现示例

\`\`\`python
from fastapi import FastAPI, Depends
import httpx
from typing import List
from pydantic import BaseModel

app = FastAPI(title="Mobile BFF")

client = httpx.AsyncClient(timeout=10.0)

# BFF聚合：移动端首页需要的数据
class HomePageResponse(BaseModel):
    user: dict
    unread_notifications: int
    recent_articles: List[dict]
    recommended_products: List[dict]
    banners: List[dict]

@app.get("/bff/mobile/home", response_model=HomePageResponse)
async def mobile_home(user=Depends(get_current_user)):
    """聚合多个服务的数据，一次性返回"""
    # 并行调用多个后端服务
    async with httpx.AsyncClient() as client:
        tasks = [
            client.get(f"http://user-service/users/{user.id}", headers={"Authorization": f"Bearer {user.token}"}),
            client.get(f"http://notification-service/unread-count?user_id={user.id}"),
            client.get("http://article-service/articles?page=1&page_size=10"),
            client.get("http://product-service/recommended?limit=5"),
            client.get("http://cms-service/banners?position=home"),
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    # 处理结果
    user_data = results[0].json() if not isinstance(results[0], Exception) else {}
    unread_count = results[1].json().get("count", 0) if not isinstance(results[1], Exception) else 0
    articles = results[2].json().get("data", []) if not isinstance(results[2], Exception) else []
    products = results[3].json() if not isinstance(results[3], Exception) else []
    banners = results[4].json() if not isinstance(results[4], Exception) else []

    return HomePageResponse(
        user=user_data,
        unread_notifications=unread_count,
        recent_articles=articles,
        recommended_products=products,
        banners=banners
    )

# BFF聚合：订单详情页
@app.get("/bff/mobile/orders/{order_id}")
async def order_detail(order_id: int, user=Depends(get_current_user)):
    """聚合订单、商品、物流、用户信息"""
    async with httpx.AsyncClient() as client:
        order_task = client.get(f"http://order-service/orders/{order_id}")
        logistics_task = client.get(f"http://logistics-service/orders/{order_id}/track")

        order_resp, logistics_resp = await asyncio.gather(order_task, logistics_task)
        order = order_resp.json()

        # 获取商品详情（批量）
        product_ids = [item["product_id"] for item in order["items"]]
        products_resp = await client.post(
            "http://product-service/products/batch",
            json={"ids": product_ids}
        )
        products = {p["id"]: p for p in products_resp.json()}

        # 组装数据
        items_with_detail = []
        for item in order["items"]:
            item["product"] = products.get(item["product_id"], {})
            items_with_detail.append(item)

        return {
            "order": order,
            "items": items_with_detail,
            "logistics": logistics_resp.json(),
        }
\`\`\`

---

## 五、最佳实践与常见坑点

### 5.1 API网关最佳实践

1. **单一入口**：所有外部请求都经过网关
2. **无状态设计**：网关本身不存储业务状态
3. **超时设置**：设置合理的超时，避免级联故障
4. **熔断降级**：后端故障时快速失败，返回降级数据
5. **全链路追踪**：传递Request-ID，串联日志
6. **监控告警**：监控QPS、延迟、错误率
7. **灰度发布**：支持按用户/比例切流
8. **缓存策略**：对幂等GET请求适当缓存

\`\`\`python
# 熔断实现（简单版）
class CircuitBreaker:
    def __init__(self, failure_threshold=5, recovery_time=30):
        self.failure_threshold = failure_threshold
        self.recovery_time = recovery_time
        self.failure_count = 0
        self.last_failure_time = 0
        self.state = "closed"  # closed, open, half-open

    async def call(self, func, *args, **kwargs):
        if self.state == "open":
            if time.time() - self.last_failure_time > self.recovery_time:
                self.state = "half-open"
            else:
                raise HTTPException(503, "服务暂时不可用")

        try:
            result = await func(*args, **kwargs)
            self.on_success()
            return result
        except Exception as e:
            self.on_failure()
            raise e

    def on_success(self):
        self.failure_count = 0
        self.state = "closed"

    def on_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = "open"
\`\`\`

### 5.2 常见坑点

**坑点1：网关做业务逻辑**

\`\`\`python
# 错误：在网关层写业务逻辑
@app.post("/api/user/login")
async def login(request: Request):
    data = await request.json()
    # ❌ 在网关直接查询数据库验证密码
    user = db.query(User).filter(User.email == data["email"]).first()
    if not user or not verify_password(data["password"], user.password_hash):
        raise HTTPException(401)
    token = create_jwt_token(user.id)
    return {"token": token}

# 正确：网关只负责转发，业务逻辑在后端服务
# 网关只做：路由、认证、限流、日志
\`\`\`

**坑点2：同步HTTP客户端阻塞事件循环**

\`\`\`python
# 错误：使用同步requests库
import requests

@app.get("/api/{service}/{path}")
async def gateway(service, path):
    # ❌ 阻塞！会阻塞整个事件循环
    response = requests.get(f"http://{service}/{path}")
    return response.json()

# 正确：使用异步httpx/aiohttp
import httpx

async with httpx.AsyncClient() as client:
    response = await client.get(f"http://{service}/{path}")
\`\`\`

**坑点3：没有设置合理的超时**

\`\`\`python
# 错误：没有超时，后端卡住时网关也卡住
client = httpx.AsyncClient()  # 默认可能没有超时

# 正确：设置合理超时
client = httpx.AsyncClient(
    timeout=httpx.Timeout(10.0, connect=5.0),
    limits=httpx.Limits(max_connections=100, max_keepalive_connections=20)
)
\`\`\`
`
  }
]