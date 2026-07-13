// =============================================================
// FastAPI 现代开发全书 - 第 4 批章节（响应处理 3 章）
// -------------------------------------------------------------
// 本批包含 3 章：
//   fp-response-model : response_model 与响应过滤
//   fp-status-headers : 状态码、响应头与 Cookie
//   fp-streaming      : 流式响应与文件下载
// ============================================================

export const chapters = [
  // ============================================================
  // 第 13 章：response_model 与响应过滤
  // ============================================================
  {
    id: "fp-response-model",
    group: "响应处理",
    icon: "🎯",
    title: "response_model 与响应过滤",
    content: `# response_model 与响应过滤

## 一、为什么需要 response_model

先看一个真实场景：你写了一个用户注册接口，内部用 User 模型处理数据，User 模型里有 \`password_hash\` 字段（密码哈希）。如果你的函数直接返回 User 对象，客户端会收到 password_hash——这是个严重的安全漏洞。

\`\`\`python
# 危险示例：password_hash 泄露
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
    id: int
    username: str
    email: str
    password_hash: str  # 敏感字段！

@app.post("/users/")
def create_user(user_data: dict):
    # 创建用户，生成 password_hash
    user = User(
        id=1,
        username=user_data["username"],
        email=user_data["email"],
        password_hash="hashed_password_xxx",
    )
    # 直接返回 user，客户端会收到 password_hash！
    return user
\`\`\`

返回的 JSON 会是 \`{"id":1,"username":"alice","email":"a@b.com","password_hash":"hashed_password_xxx"}\`，密码哈希暴露了。

\`response_model\` 就是为了解决这个问题。它让你声明"接口实际返回什么结构"，FastAPI 会自动过滤掉多余字段。这是 API 安全和契约一致性的核心机制。

## 二、response_model 基础用法

\`response_model\` 是路由装饰器的一个参数，指定该接口返回的数据结构。

\`\`\`python
# demo 1：response_model 基础
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# 内部模型：包含所有字段（含敏感字段）
class UserInDB(BaseModel):
    id: int
    username: str
    email: str
    password_hash: str
    is_active: bool = True

# 输出模型：只包含可以公开的字段
class UserOut(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool

@app.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int):
    # 内部查询数据库，得到 UserInDB（含 password_hash）
    user = UserInDB(
        id=user_id,
        username="alice",
        email="alice@example.com",
        password_hash="$2b$12$xxx",
        is_active=True,
    )
    # 返回 UserInDB，但 response_model=UserOut 会过滤
    return user

# 客户端实际收到：
# {"id":1,"username":"alice","email":"alice@example.com","is_active":true}
# password_hash 被自动过滤掉了！
\`\`\`

工作原理：FastAPI 在返回响应前，会把你的返回值"重新序列化"成 response_model 指定的模型。这个过程中，不在 response_model 里的字段会被丢弃。

注意：\`response_model\` 和函数返回值类型注解是两回事。

\`\`\`python
# demo 2：response_model vs 返回值类型注解
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class UserOut(BaseModel):
    id: int
    name: str

# 方式 1：用 response_model 参数（推荐，明确控制输出）
@app.get("/users/{id}", response_model=UserOut)
def get_user(id: int):
    return {"id": id, "name": "Alice", "extra": "会被过滤"}

# 方式 2：用返回值类型注解（也能过滤，但语义不同）
@app.get("/users2/{id}")
def get_user2(id: int) -> UserOut:
    return {"id": id, "name": "Bob", "extra": "也会被过滤"}
\`\`\`

两种方式都能过滤字段，但 \`response_model\` 参数更明确、更可控，推荐用它。返回值注解更多是给 IDE 和类型检查器看的。

## 三、自动过滤的细节

response_model 的过滤是"按字段名匹配"，只保留 response_model 里定义的字段。

\`\`\`python
# demo 3：自动过滤的细节
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class FullItem(BaseModel):
    id: int
    name: str
    price: float
    cost: float       # 成本价（内部数据，不能泄露）
    profit_margin: float  # 利润率（内部数据）

class PublicItem(BaseModel):
    id: int
    name: str
    price: float

@app.get("/items/{item_id}", response_model=PublicItem)
def get_item(item_id: int):
    # 返回完整数据
    return {
        "id": item_id,
        "name": "Python 书",
        "price": 59.9,
        "cost": 30.0,          # 会被过滤
        "profit_margin": 0.5,  # 会被过滤
        "extra_field": "xxx",  # 会被过滤（不在 PublicItem 里）
    }

# 客户端收到：{"id":1,"name":"Python 书","price":59.9}
# cost、profit_margin、extra_field 都被过滤了
\`\`\`

这种"内部模型 + 公开模型"的模式是 API 开发的最佳实践：

- 内部模型（如 \`ItemInDB\`）包含所有字段，用于数据库操作。
- 公开模型（如 \`PublicItem\`）只含可公开字段，用 \`response_model\` 指定。
- 路由函数返回内部模型，FastAPI 自动过滤成公开模型。

这样你不用手动 \`del user.password_hash\` 或构造新字典，框架帮你搞定。

## 四、response_model_exclude / response_model_include

有时候你不想定义两个模型，而是想"在同一个模型基础上，临时排除/包含某些字段"。这时用 \`response_model_exclude\` 和 \`response_model_include\`。

\`\`\`python
# demo 4：response_model_exclude
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
    id: int
    username: str
    email: str
    password_hash: str
    is_active: bool = True

# 用 response_model_exclude 临时排除字段
@app.get("/users/{user_id}", response_model=User, response_model_exclude={"password_hash"})
def get_user(user_id: int):
    return User(
        id=user_id,
        username="alice",
        email="a@b.com",
        password_hash="xxx",
    )
# 客户端收到：{"id":1,"username":"alice","email":"a@b.com","is_active":true}
# password_hash 被排除了
\`\`\`

\`response_model_include\` 则相反，只保留指定字段：

\`\`\`python
# demo 5：response_model_include
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
    id: int
    username: str
    email: str
    password_hash: str
    is_active: bool = True
    created_at: str
    last_login: str

# 只返回 id 和 username
@app.get("/users/{user_id}/brief", response_model=User, response_model_include={"id", "username"})
def get_user_brief(user_id: int):
    return User(
        id=user_id,
        username="alice",
        email="a@b.com",
        password_hash="xxx",
        created_at="2024-01-01",
        last_login="2024-07-01",
    )
# 客户端收到：{"id":1,"username":"alice"}
# 只剩 id 和 username
\`\`\`

这两种方式的取舍：

- **定义多个模型**（如 UserOut、UserBrief）：清晰、可复用、文档准确。推荐。
- **exclude/include 参数**：灵活、临时性强，但文档会显示完整模型（可能让前端困惑）。适合一次性场景。

实际项目中，优先定义专门的输出模型。exclude/include 适合"个别接口需要特殊处理"的场景。

### 嵌套字段的排除

\`\`\`python
# demo 6：排除嵌套字段
from fastapi import FastAPI
from pydantic import BaseModel

class Address(BaseModel):
    city: str
    street: str
    zip_code: str

class User(BaseModel):
    id: int
    name: str
    address: Address

app = FastAPI()

# 排除嵌套字段：用字典指定路径
@app.get(
    "/users/{user_id}",
    response_model=User,
    response_model_exclude={"address": {"zip_code"}}
)
def get_user(user_id: int):
    return User(
        id=user_id,
        name="Alice",
        address={"city": "深圳", "street": "科技路", "zip_code": "518000"},
    )
# 客户端收到：
# {"id":1,"name":"Alice","address":{"city":"深圳","street":"科技路"}}
# address 里的 zip_code 被排除了
\`\`\`

嵌套排除用字典语法：\`{"address": {"zip_code"}}\` 表示排除 \`address.zip_code\`。可以多层嵌套。

## 五、response_model_by_alias

还记得 Pydantic 的别名（alias）吗？默认情况下，response_model 输出用字段名。如果你想用别名输出，设置 \`response_model_by_alias=True\`。

\`\`\`python
# demo 7：response_model_by_alias
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

class User(BaseModel):
    # 字段名是 user_id，别名是 userId
    user_id: int = Field(alias="userId")
    user_name: str = Field(alias="userName")

# by_alias=False（默认）：用字段名
@app.get("/users1/{id}", response_model=User)
def get_user1(id: int):
    return {"userId": id, "userName": "Alice"}
# 客户端收到：{"user_id":1,"user_name":"Alice"}

# by_alias=True：用别名
@app.get("/users2/{id}", response_model=User, response_model_by_alias=True)
def get_user2(id: int):
    return {"userId": id, "userName": "Alice"}
# 客户端收到：{"userId":1,"userName":"Alice"}
\`\`\`

对接前端 JS（驼峰命名）时，\`response_model_by_alias=True\` 让输出符合对方习惯。这在全栈协作中很常见。

## 六、list[Model] 列表响应

API 经常需要返回列表，如"获取所有用户"。\`response_model\` 可以是 \`list[Model]\`。

\`\`\`python
# demo 8：列表响应
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class UserOut(BaseModel):
    id: int
    username: str
    email: str

# 模拟数据库
db_users = [
    {"id": 1, "username": "alice", "email": "a@b.com", "password_hash": "xxx"},
    {"id": 2, "username": "bob", "email": "b@b.com", "password_hash": "yyy"},
    {"id": 3, "username": "carol", "email": "c@b.com", "password_hash": "zzz"},
]

# response_model=list[UserOut] 表示返回 UserOut 列表
@app.get("/users", response_model=list[UserOut])
def list_users():
    # 返回原始字典列表（含 password_hash）
    return db_users

# 客户端收到：
# [
#   {"id":1,"username":"alice","email":"a@b.com"},
#   {"id":2,"username":"bob","email":"b@b.com"},
#   {"id":3,"username":"carol","email":"c@b.com"}
# ]
# 每个元素的 password_hash 都被过滤了
\`\`\`

\`list[UserOut]\` 让 FastAPI 知道"返回的是列表，列表里每个元素都是 UserOut 结构"。这保证每个元素都会被过滤。如果不指定 response_model，所有字段（包括 password_hash）都会泄露。

### 分页列表响应

\`\`\`python
# demo 9：分页列表响应
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class UserOut(BaseModel):
    id: int
    username: str

class PageResponse(BaseModel):
    total: int          # 总数
    page: int           # 当前页
    page_size: int      # 每页大小
    data: list[UserOut] # 数据列表

@app.get("/users/page/{page}", response_model=PageResponse)
def get_users_page(page: int):
    # 模拟分页查询
    all_users = [
        {"id": 1, "username": "alice", "password_hash": "xxx"},
        {"id": 2, "username": "bob", "password_hash": "yyy"},
        {"id": 3, "username": "carol", "password_hash": "zzz"},
    ]
    page_size = 2
    start = (page - 1) * page_size
    end = start + page_size
    page_data = all_users[start:end]

    return {
        "total": len(all_users),
        "page": page,
        "page_size": page_size,
        "data": page_data,  # data 里的 password_hash 会被过滤
    }

# 客户端收到：
# {"total":3,"page":1,"page_size":2,"data":[{"id":1,"username":"alice"},{"id":2,"username":"bob"}]}
\`\`\`

分页响应是最常见的列表场景。注意 \`data: list[UserOut]\` 让嵌套列表里的元素也被过滤。

## 七、输入模型与输出模型分离的最佳实践

这是本章最重要的设计原则。**永远不要用同一个模型做输入和输出**。

\`\`\`python
# demo 10：输入输出模型分离
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# 输入模型：客户端创建用户时传的数据
class UserCreate(BaseModel):
    username: str
    email: str
    password: str  # 客户端传明文密码（内部会哈希）

# 输出模型：返回给客户端的数据
class UserOut(BaseModel):
    id: int
    username: str
    email: str
    # 没有 password！客户端永远收不到密码

# 内部模型：数据库存储的完整数据
class UserInDB(BaseModel):
    id: int
    username: str
    email: str
    password_hash: str  # 哈希后的密码
    is_active: bool = True

# 创建用户
@app.post("/users", response_model=UserOut, status_code=201)
def create_user(user_in: UserCreate):
    # 1. 校验输入（FastAPI 自动用 UserCreate 校验请求体）
    # 2. 哈希密码
    hashed = "hashed_" + user_in.password
    # 3. 存入数据库（这里用字典模拟）
    user_db = UserInDB(
        id=1,
        username=user_in.username,
        email=user_in.email,
        password_hash=hashed,
    )
    # 4. 返回，response_model=UserOut 自动过滤掉 password_hash
    return user_db

# 查询用户
@app.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int):
    # 模拟从数据库查询
    user_db = UserInDB(
        id=user_id,
        username="alice",
        email="a@b.com",
        password_hash="hashed_xxx",
    )
    return user_db
\`\`\`

三个模型的职责：

| 模型 | 用途 | 包含字段 |
|------|------|---------|
| \`UserCreate\` | 输入（请求体） | username, email, password |
| \`UserInDB\` | 内部（数据库） | id, username, email, password_hash, is_active |
| \`UserOut\` | 输出（响应） | id, username, email |

分离的好处：

1. **安全**：密码永远不会出现在响应里（UserOut 没有 password 字段）。
2. **清晰**：每个模型职责单一，看模型就知道它干什么。
3. **灵活**：输入和输出可以独立变化。比如输出加个 \`created_at\` 字段，不影响输入。
4. **文档准确**：Swagger 文档会正确显示请求体结构（UserCreate）和响应结构（UserOut），不会混淆。

## 八、response_model 的其他用途

### 文档生成

\`response_model\` 会驱动 OpenAPI 文档的生成。Swagger UI 的 Responses 部分会显示 response_model 的结构，前端据此知道返回什么。

\`\`\`python
# demo 11：response_model 影响文档
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ProductOut(BaseModel):
    id: int
    name: str
    price: float
    description: str | None = None

# 文档会显示 200 响应体是 ProductOut 结构
@app.get("/products/{id}", response_model=ProductOut)
def get_product(id: int):
    return {"id": id, "name": "书", "price": 59.9}
\`\`\`

打开 \`/docs\`，你会看到这个接口的 Response 部分有详细的 ProductOut 字段说明。前端开发者看文档就能写代码，不用问你。

### response_model_exclude_unset

结合 Pydantic 的 \`exclude_unset\`，可以让响应只包含实际赋值的字段。

\`\`\`python
# demo 12：response_model_exclude_unset
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class UserOut(BaseModel):
    id: int
    name: str
    email: str = "default@example.com"  # 有默认值
    bio: str = ""                        # 有默认值

@app.get("/users/{id}", response_model=UserOut, response_model_exclude_unset=True)
def get_user(id: int):
    # 只设置了部分字段
    return {"id": id, "name": "Alice"}
# 客户端收到：{"id":1,"name":"Alice"}
# email 和 bio 没设置，不输出

@app.get("/users2/{id}", response_model=UserOut)
def get_user2(id: int):
    # 不加 exclude_unset，所有字段都输出
    return {"id": id, "name": "Bob"}
# 客户端收到：{"id":1,"name":"Bob","email":"default@example.com","bio":""}
\`\`\`

## 九、小结

- **response_model**：声明接口返回结构，FastAPI 自动过滤多余字段。安全过滤的核心机制。
- **输入输出分离**：定义 UserCreate（输入）、UserInDB（内部）、UserOut（输出）三个模型，各司其职。
- **exclude/include**：临时排除/包含字段，支持嵌套路径。
- **by_alias**：用别名输出，适配前端命名习惯。
- **list[Model]**：列表响应，每个元素都被过滤。
- **文档联动**：response_model 驱动 OpenAPI 文档的响应结构展示。

response_model 是 FastAPI 安全和契约一致性的基石。养成"每个接口都写 response_model"的习惯，避免数据泄露和文档失真。
`
  },

  // ============================================================
  // 第 14 章：状态码、响应头与 Cookie
  // ============================================================
  {
    id: "fp-status-headers",
    group: "响应处理",
    icon: "📮",
    title: "状态码、响应头与 Cookie",
    content: `# 状态码、响应头与 Cookie

## 一、HTTP 状态码：API 的"信号灯"

每个 HTTP 响应都带一个状态码（status code），它是一个 3 位数字，告诉客户端"请求的结果如何"。状态码是 API 通信的"信号灯"，让客户端不用解析响应体就能知道大致情况。

状态码分 5 类：

| 类别 | 范围 | 含义 | 典型例子 |
|------|------|------|---------|
| 1xx | 100-199 | 信息性 | 100 Continue |
| 2xx | 200-299 | 成功 | 200 OK, 201 Created |
| 3xx | 300-399 | 重定向 | 301 Moved, 304 Not Modified |
| 4xx | 400-499 | 客户端错误 | 400 Bad Request, 404 Not Found |
| 5xx | 500-599 | 服务端错误 | 500 Internal Server Error |

日常开发最常用的是 2xx 和 4xx。理解每个状态码的语义，能让 API 更规范、更易用。

## 二、status_code：设置响应状态码

FastAPI 默认返回 200（GET）或 200（POST 等也默认 200）。你可以用 \`status_code\` 参数修改。

\`\`\`python
# demo 1：status_code 基础
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class UserCreate(BaseModel):
    username: str
    email: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str

# 创建资源用 201（Created）
@app.post("/users", response_model=UserOut, status_code=201)
def create_user(user: UserCreate):
    return {"id": 1, "username": user.username, "email": user.email}

# 删除资源用 204（No Content，表示成功但无内容返回）
@app.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int):
    # 删除逻辑...
    return None  # 204 通常不返回内容
\`\`\`

\`status_code\` 可以是数字（如 201）或 \`starlette.status\` 里的常量（更可读）：

\`\`\`python
# demo 2：用 status 常量
from fastapi import FastAPI, status

app = FastAPI()

@app.post("/items", status_code=status.HTTP_201_CREATED)
def create_item():
    return {"id": 1}

@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int):
    return None

@app.get("/items", status_code=status.HTTP_200_OK)
def list_items():
    return []
\`\`\`

用 \`status.HTTP_201_CREATED\` 比 \`201\` 更清晰，IDE 也能自动补全。

## 三、HTTP 状态码最佳实践

选择正确的状态码，是 API 设计的基本功。以下是常用状态码的使用场景：

### 2xx 成功

\`\`\`python
# demo 3：2xx 状态码的使用
from fastapi import FastAPI, status
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    id: int
    name: str

# 200 OK：GET 请求成功，或 POST/PUT 成功返回内容
@app.get("/items/{item_id}", status_code=status.HTTP_200_OK)
def get_item(item_id: int):
    return {"id": item_id, "name": "书"}

# 201 Created：POST 创建资源成功
# 响应体通常包含新创建的资源
@app.post("/items", status_code=status.HTTP_201_CREATED)
def create_item(item: Item):
    return item

# 204 No Content：DELETE/PUT 成功，但无需返回内容
# 响应体为空
@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int):
    # 删除逻辑，不返回任何内容
    return None
\`\`\`

三个 2xx 的区别：

- **200 OK**：请求成功，响应体有内容。GET 请求几乎都用 200。
- **201 Created**：资源创建成功。POST 创建资源用 201，响应体通常返回新创建的资源。
- **204 No Content**：请求成功，但没有内容返回。DELETE 操作常用，因为删除后确实没什么可返回的。

### 4xx 客户端错误

\`\`\`python
# demo 4：4xx 状态码的使用
from fastapi import FastAPI, status, HTTPException
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

# 400 Bad Request：客户端请求语法错误或语义错误
@app.post("/items")
def create_item(item: Item):
    if item.price < 0:
        # 主动抛 400，表示客户端传了不合理的数据
        raise HTTPException(status_code=400, detail="价格不能为负数")
    return item

# 404 Not Found：资源不存在
@app.get("/items/{item_id}")
def get_item(item_id: int):
    db = {1: "书", 2: "笔"}
    if item_id not in db:
        # 资源不存在，抛 404
        raise HTTPException(status_code=404, detail="商品不存在")
    return {"id": item_id, "name": db[item_id]}

# 422 Unprocessable Entity：FastAPI 自动返回（Pydantic 校验失败）
# 你不用手动抛，FastAPI 在请求体校验失败时自动返回 422
# 比如客户端传 {"name": 123}（name 应该是 str），会自动 422
\`\`\`

4xx 状态码的语义：

- **400 Bad Request**：请求有问题（语法错或语义错）。比如业务规则校验失败。
- **401 Unauthorized**：未认证（没登录或 token 无效）。
- **403 Forbidden**：已认证但无权限。
- **404 Not Found**：资源不存在。
- **422 Unprocessable Entity**：请求体格式对，但校验失败（FastAPI/Pydantic 自动处理）。
- **429 Too Many Requests**：请求太频繁（限流）。

### 5xx 服务端错误

\`\`\`python
# demo 5：5xx 状态码
from fastapi import FastAPI, status, HTTPException

app = FastAPI()

# 500 Internal Server Error：服务器内部错误
# 通常不要主动抛 500，而是让异常自然发生，FastAPI 会自动返回 500
@app.get("/dangerous")
def dangerous():
    # 这个除零错误会让 FastAPI 返回 500
    result = 1 / 0
    return {"result": result}

# 503 Service Unavailable：服务暂不可用（维护中或过载）
@app.get("/maintenance")
def maintenance():
    raise HTTPException(status_code=503, detail="系统维护中，请稍后再试")
\`\`\`

5xx 表示"服务器自己出了问题"，客户端没法解决。正常情况下不应该频繁出现 5xx，如果出现，说明有 bug 或服务器过载。

## 四、Response 对象：直接操作响应

除了用 \`status_code\` 参数，你还可以直接操作 \`Response\` 对象，更灵活地控制响应。

\`\`\`python
# demo 6：Response 对象基础
from fastapi import FastAPI, Response

app = FastAPI()

# 方式 1：用 Response 类型注解注入
@app.get("/custom1")
def custom1(response: Response):
    # 直接设置响应头
    response.headers["X-Custom-Header"] = "hello"
    # 设置状态码
    response.status_code = 201
    # 设置 Cookie
    response.set_cookie(key="token", value="abc123")
    return {"message": "ok"}

# 方式 2：直接返回 Response 对象（完全自定义响应）
from fastapi.responses import JSONResponse

@app.get("/custom2")
def custom2():
    # 直接构造 JSONResponse 返回
    return JSONResponse(
        content={"message": "created"},
        status_code=201,
        headers={"X-My-Header": "value"},
    )
\`\`\`

两种方式的区别：

- **方式 1（注入 Response）**：仍然返回普通数据（字典/模型），FastAPI 帮你序列化，你只是"顺便"修改响应头/状态码。适合"主体返回 JSON，但要加自定义头"的场景。
- **方式 2（返回 Response 对象）**：完全自己控制响应内容、状态码、头。适合"非 JSON 响应"或"完全自定义"的场景。

## 五、自定义响应头

响应头（response header）携带响应的元信息，如内容类型、缓存策略、自定义标记等。

\`\`\`python
# demo 7：自定义响应头
from fastapi import FastAPI, Response

app = FastAPI()

@app.get("/api/data")
def get_data(response: Response):
    # 添加自定义响应头
    response.headers["X-Request-ID"] = "req-12345"        # 请求追踪 ID
    response.headers["X-Rate-Limit"] = "100"              # 速率限制信息
    response.headers["X-Response-Time"] = "0.05s"         # 响应时间
    # 添加跨域头（CORS，实际项目用中间件统一处理）
    response.headers["Access-Control-Allow-Origin"] = "*"
    return {"data": "hello"}

# 自定义头的命名规范：
# - 标准头用首字母大写：Content-Type, X-Request-ID
# - 自定义头通常以 X- 开头（虽然新规范不强制，但仍是惯例）
# - 头名不区分大小写，但建议统一风格
\`\`\`

常见响应头用途：

- \`Content-Type\`：响应体类型（FastAPI 自动设置为 application/json）。
- \`Cache-Control\`：缓存策略（如 no-cache、max-age=3600）。
- \`X-Request-ID\`：请求追踪，便于日志排查。
- \`X-Rate-Limit-*\`：限流信息，让客户端知道还剩多少配额。
- \`Location\`：201 响应里指向新创建资源的 URL。

\`\`\`python
# demo 8：201 响应配合 Location 头
from fastapi import FastAPI, Response, status
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    id: int
    name: str

@app.post("/items", status_code=status.HTTP_201_CREATED)
def create_item(item: Item, response: Response):
    # Location 头指向新创建的资源
    response.headers["Location"] = f"/items/{item.id}"
    return item
# 客户端收到 201，响应头有 Location: /items/1
# 前端可以据此跳转到详情页
\`\`\`

## 六、Cookie 操作

Cookie 是存储在客户端的小段数据，每次请求自动带上。常用于会话管理（session ID）、用户偏好等。

### 设置 Cookie

\`\`\`python
# demo 9：设置 Cookie
from fastapi import FastAPI, Response

app = FastAPI()

@app.post("/login")
def login(response: Response):
    # 模拟登录成功，设置 session token
    response.set_cookie(
        key="session_token",      # Cookie 名
        value="abc123xyz",        # Cookie 值
        max_age=3600,             # 过期时间（秒），1 小时
        httponly=True,            # JavaScript 无法访问（防 XSS）
        secure=True,              # 仅 HTTPS 传输
        samesite="lax",           # 跨站策略（防 CSRF）
    )
    return {"message": "登录成功"}

# set_cookie 参数详解：
# - key: Cookie 名
# - value: Cookie 值
# - max_age: 过期时间（秒），过期后浏览器自动删除
# - expires: 过期时间（具体日期）
# - path: 生效路径，默认 "/"
# - domain: 生效域名
# - httponly: True 表示 JavaScript 读不到（防 XSS 窃取）
# - secure: True 表示仅 HTTPS 传输
# - samesite: "lax"/"strict"/"none"，跨站发送策略（防 CSRF）
\`\`\`

### 读取 Cookie

\`\`\`python
# demo 10：读取 Cookie
from fastapi import FastAPI, Cookie, HTTPException

app = FastAPI()

@app.get("/profile")
def profile(session_token: str | None = Cookie(default=None)):
    # Cookie(...) 表示从 Cookie 中读取名为 session_token 的值
    # 参数名 session_token 必须和 Cookie 名一致
    if not session_token:
        # 没 Cookie，说明没登录
        raise HTTPException(status_code=401, detail="未登录")
    # 有 Cookie，模拟验证
    if session_token != "abc123xyz":
        raise HTTPException(status_code=401, detail="Cookie 无效")
    return {"user": "alice", "token": session_token}
\`\`\`

\`Cookie(default=None)\` 是 FastAPI 的依赖注入，表示"从请求的 Cookie 头里提取名为 session_token 的值"。参数名必须和 Cookie 名一致（FastAPI 自动转换下划线/连字符）。

### 删除 Cookie

\`\`\`python
# demo 11：删除 Cookie
from fastapi import FastAPI, Response

app = FastAPI()

@app.post("/logout")
def logout(response: Response):
    # 删除 Cookie：设置同名 Cookie，max_age=0 或过期
    response.delete_cookie(key="session_token")
    return {"message": "已退出登录"}

# delete_cookie 的原理：
# 它实际上是设置一个 max_age=0 的同名 Cookie
# 浏览器收到后会立即删除该 Cookie
\`\`\`

Cookie 安全要点：

1. **httponly=True**：防止 JavaScript 读取 Cookie，避免 XSS 攻击窃取会话。
2. **secure=True**：确保 Cookie 只通过 HTTPS 传输，不在 HTTP 中泄露。
3. **samesite="lax" 或 "strict"**：防止 CSRF 攻击。\`lax\` 允许顶级导航带 Cookie，\`strict\` 完全不带。

这三个设置是现代 Web 应用 Cookie 的安全标配。

## 七、不同类型的 Response

FastAPI 提供多种 Response 类，用于返回不同类型的内容。

\`\`\`python
# demo 12：不同类型的 Response
from fastapi import FastAPI
from fastapi.responses import (
    JSONResponse,      # JSON 响应（默认）
    PlainTextResponse, # 纯文本
    HTMLResponse,      # HTML
    RedirectResponse,  # 重定向
)

app = FastAPI()

# JSONResponse（默认）
@app.get("/json")
def get_json():
    return JSONResponse(content={"msg": "hello"})

# PlainTextResponse：纯文本
@app.get("/text")
def get_text():
    return PlainTextResponse(content="Hello, World!")

# HTMLResponse：HTML
@app.get("/html")
def get_html():
    return HTMLResponse(content="<h1>Hello</h1>")

# RedirectResponse：重定向
@app.get("/old")
def old_page():
    # 返回 302，跳转到 /new
    return RedirectResponse(url="/new", status_code=302)

@app.get("/new")
def new_page():
    return {"message": "这是新页面"}
\`\`\`

返回不同 Response 类型时，FastAPI 不再自动处理序列化，你要自己构造响应内容。

## 八、综合实战：带状态码和头的完整接口

\`\`\`python
# demo 13：综合实战
from fastapi import FastAPI, Response, status, HTTPException, Cookie
from pydantic import BaseModel

app = FastAPI()

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str

# 模拟数据库
db = {}
next_id = 1

# 创建用户：201 + Location 头
@app.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, response: Response):
    global next_id
    user = UserOut(id=next_id, username=user_in.username, email=user_in.email)
    db[next_id] = user
    # 设置 Location 头指向新资源
    response.headers["Location"] = f"/users/{user.id}"
    next_id += 1
    return user

# 查询用户：200 或 404
@app.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int):
    if user_id not in db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")
    return db[user_id]

# 删除用户：204，需要 Cookie 认证
@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, session_token: str | None = Cookie(default=None)):
    # 认证检查
    if not session_token or session_token != "admin_token":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="无权限")
    if user_id not in db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在")
    del db[user_id]
    return None
\`\`\`

这个例子综合运用了 status_code、Response.headers、Cookie、HTTPException，是实际项目接口的典型写法。

## 九、小结

- **状态码**：用 \`status_code\` 参数设置，推荐用 \`status.HTTP_XXX\` 常量。
  - 200：GET 成功；201：POST 创建成功；204：删除成功无内容。
  - 400：请求错误；401：未认证；403：无权限；404：不存在；422：校验失败。
  - 500：服务器错误；503：维护中。
- **Response 对象**：注入 \`Response\` 修改头和状态码，或返回 \`JSONResponse\` 等完全自定义。
- **响应头**：\`response.headers["X-XX"] = "value"\`，用于追踪 ID、限流信息、Location 等。
- **Cookie**：\`set_cookie\` 设置（注意 httponly/secure/samesite 安全配置），\`Cookie()\` 读取，\`delete_cookie\` 删除。
- **Response 类型**：JSONResponse、PlainTextResponse、HTMLResponse、RedirectResponse 等。

状态码、响应头、Cookie 是 HTTP 协议的基础设施。正确使用它们，API 才规范、安全、易用。
`
  },

  // ============================================================
  // 第 15 章：流式响应与文件下载
  // ============================================================
  {
    id: "fp-streaming",
    group: "响应处理",
    icon: "🌊",
    title: "流式响应与文件下载",
    content: `# 流式响应与文件下载

## 一、为什么需要流式响应

到目前为止，我们写的接口都是"一次性返回所有数据"：函数返回一个字典/模型，FastAPI 把它序列化成 JSON，一次性发给客户端。对于小数据量，这没问题。

但考虑这些场景：

- **大文件下载**：一个 2GB 的视频文件。如果一次性读到内存再发送，服务器内存会被撑爆。
- **实时数据**：股票行情、日志流、AI 生成内容（ChatGPT 就是流式返回的）。数据是持续产生的，不能等全部生成完再返回。
- **大报表导出**：导出 100 万行 CSV。如果先在内存拼好，可能占几百 MB。

这些场景的共同点是：**数据量大或持续时间长，不能一次性返回**。解决方案就是**流式响应（streaming response）**——把数据分成一块一块，边生成边发送。

打个比方：一次性响应像"等一锅饭煮熟了全端上来"，流式响应像"自助餐，边煮边吃，随时拿"。后者不用等，也不用那么大的锅（内存）。

FastAPI 提供两个核心类处理文件和流：

- \`StreamingResponse\`：流式响应，配合生成器函数，边 yield 边发送。
- \`FileResponse\`：文件响应，专门用于返回文件，自动处理分块和头。

## 二、StreamingResponse 基础

\`StreamingResponse\` 接收一个**迭代器/生成器**作为内容源。FastAPI 从迭代器里逐个取数据，每取到一块就发送给客户端，不用等全部数据就绪。

\`\`\`python
# demo 1：最简单的 StreamingResponse
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import time

app = FastAPI()

# 生成器函数：yield 数据
def generate_numbers():
    # 每秒生成一个数字，共 5 个
    for i in range(5):
        time.sleep(1)  # 模拟耗时操作
        # yield 一块数据（必须是 bytes 或 str）
        yield f"数据 {i}\\n"

@app.get("/stream")
def stream():
    # 把生成器传给 StreamingResponse
    return StreamingResponse(
        generate_numbers(),
        media_type="text/plain",  # 内容类型
    )

# 客户端会看到数据一条一条出现，而不是等 5 秒后一次性出现
\`\`\`

关键点：

1. **生成器函数**：用 \`yield\` 而不是 \`return\` 的函数。每次 yield 产生一块数据。
2. **迭代器传入**：把生成器对象（注意是调用后的对象 \`generate_numbers()\`，不是函数本身）传给 StreamingResponse。
3. **media_type**：设置 Content-Type，告诉客户端这是什么数据。\`text/plain\` 是纯文本。

流式响应的效果：客户端不用等 5 秒，第 1 秒就看到"数据 0"，第 2 秒看到"数据 1"...这大大改善了用户体验（不用盯着空白屏幕等待）。

## 三、生成器函数：yield 的力量

生成器是流式响应的核心。理解 \`yield\` 是关键。

普通函数用 \`return\` 返回一个值就结束了。生成器函数用 \`yield\`，每次 \`yield\` 产生一个值但**不结束**，下次调用从 yield 后面继续。

\`\`\`python
# demo 2：理解生成器
def my_generator():
    print("开始")
    yield "A"
    print("继续")
    yield "B"
    print("再继续")
    yield "C"
    print("结束")

# 调用生成器函数，得到生成器对象（不会立即执行）
gen = my_generator()

# 逐个取值
print(next(gen))  # 输出"开始"然后返回 "A"
print(next(gen))  # 输出"继续"然后返回 "B"
print(next(gen))  # 输出"再继续"然后返回 "C"
print(next(gen))  # 输出"结束"然后抛 StopIteration
\`\`\`

在 StreamingResponse 里，FastAPI 就是不断调用 \`next(gen)\` 取数据，直到 StopIteration。每次取到的数据立即发送给客户端。

### 实时日志流

\`\`\`python
# demo 3：实时日志流
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import time
import datetime

app = FastAPI()

def generate_logs():
    # 持续生成日志，模拟实时日志流
    for i in range(10):
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        log_line = f"[{timestamp}] 日志 #{i}: 系统运行正常\\n"
        yield log_line
        time.sleep(0.5)  # 每 0.5 秒一条

@app.get("/logs/stream")
def stream_logs():
    return StreamingResponse(
        generate_logs(),
        media_type="text/plain",
    )

# 客户端会看到日志一条一条实时出现
# 这比"等所有日志生成完再返回"体验好得多
\`\`\`

### 模拟 AI 流式回复

\`\`\`python
# demo 4：模拟 AI 流式回复（类似 ChatGPT）
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import time

app = FastAPI()

def generate_ai_response(prompt: str):
    # 模拟 AI 逐字生成回复
    full_response = f"关于「{prompt}」，我的回答是：这是一个模拟的流式回复，每个字都会逐个出现。"
    for char in full_response:
        yield char
        time.sleep(0.05)  # 每个字间隔 50ms，模拟生成延迟

@app.get("/ai/chat")
def ai_chat(prompt: str):
    return StreamingResponse(
        generate_ai_response(prompt),
        media_type="text/plain",
    )

# 客户端会看到文字逐字出现，就像 ChatGPT 那样
\`\`\`

这就是 ChatGPT 等流式输出的原理。前端用 \`fetch\` 配合 \`ReadableStream\` 读取，实现"打字机效果"。

## 四、大文件分块下载

流式响应最经典的应用是大文件下载。不把文件全读进内存，而是分块读取、分块发送。

\`\`\`python
# demo 5：大文件分块下载
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import os

app = FastAPI()

def file_chunk_generator(filepath: str, chunk_size: int = 8192):
    # chunk_size：每块大小（字节），8KB 是常见值
    with open(filepath, "rb") as f:  # "rb" 二进制读取
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break  # 文件读完
            yield chunk  # yield 一块 bytes

@app.get("/download/{filename}")
def download_file(filename: str):
    filepath = f"/data/files/{filename}"
    if not os.path.exists(filepath):
        return {"error": "文件不存在"}

    return StreamingResponse(
        file_chunk_generator(filepath),
        media_type="application/octet-stream",  # 二进制流
        headers={
            # Content-Disposition 让浏览器触发下载（而不是显示）
            # attachment 表示附件，filename 指定下载文件名
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
\`\`\`

关键点：

1. **\`open(filepath, "rb")\`**：用二进制模式读文件，\`rb\` = read binary。
2. **\`f.read(chunk_size)\`**：每次读一块（如 8KB），不会把整个文件读进内存。
3. **\`media_type="application/octet-stream"\`**：通用的二进制流类型，浏览器会当未知文件处理。
4. **\`Content-Disposition\`**：告诉浏览器"这是附件，请下载"，\`filename\` 指定保存时的文件名。

这个方案下载 2GB 文件时，内存占用始终只有 8KB（一个 chunk 的大小），非常高效。

### chunk_size 怎么选

\`chunk_size\` 决定每次读多少字节。常见值：

- **8KB（8192）**：经典默认值，平衡内存和效率。
- **64KB（65536）**：大一点，减少 I/O 次数，适合大文件。
- **1MB（1048576）**：很大，适合超大文件，但内存占用增加。

太小（如 1 字节）会导致大量 I/O 调用，效率低。太大（如 1GB）失去流式意义。8KB-64KB 是甜点区。

## 五、FileResponse：文件响应的便捷方式

对于"返回一个文件"的场景，FastAPI 提供了更便捷的 \`FileResponse\`。它自动处理分块读取、Content-Type、Content-Disposition 等。

\`\`\`python
# demo 6：FileResponse 基础
from fastapi import FastAPI
from fastapi.responses import FileResponse
import os

app = FastAPI()

@app.get("/download/{filename}")
def download_file(filename: str):
    filepath = f"/data/files/{filename}"
    if not os.path.exists(filepath):
        return {"error": "文件不存在"}

    return FileResponse(
        path=filepath,                    # 文件路径
        filename=filename,                # 下载时的文件名（触发下载）
        media_type="application/octet-stream",  # 可选，FileResponse 会自动推断
    )

# FileResponse 自动做的事：
# 1. 分块读取文件（不用你写生成器）
# 2. 设置 Content-Disposition: attachment
# 3. 推断 Content-Type（如果没指定）
# 4. 支持 Range 请求（断点续传）
# 5. 设置 Content-Length
\`\`\`

\`FileResponse\` 比 \`StreamingResponse\` 更省心，适合"直接返回文件"的场景。它还支持 **断点续传**（Range 请求），客户端中断后可以从断点继续下载。

### FileResponse 的 media_type 自动推断

\`\`\`python
# demo 7：FileResponse 自动推断 Content-Type
from fastapi import FastAPI
from fastapi.responses import FileResponse

app = FastAPI()

# 不指定 media_type，FileResponse 根据文件扩展名推断
@app.get("/images/{name}")
def get_image(name: str):
    # 如果 name 是 "photo.jpg"，media_type 自动是 "image/jpeg"
    # 如果 name 是 "doc.pdf"，media_type 自动是 "application/pdf"
    return FileResponse(
        path=f"/data/images/{name}",
        filename=name,
    )

# 如果想让浏览器在线预览（而不是下载），不要指定 filename
# 没有 filename，FileResponse 不设置 attachment，浏览器会尝试显示
@app.get("/preview/{name}")
def preview_file(name: str):
    return FileResponse(
        path=f"/data/images/{name}",
        # 不传 filename，浏览器会尝试在线显示（如图片、PDF）
    )
\`\`\`

\`filename\` 参数的作用：

- **传了 filename**：设置 \`Content-Disposition: attachment\`，浏览器触发下载。
- **不传 filename**：不设 attachment，浏览器根据 Content-Type 决定是显示还是下载（图片/PDF 会直接显示）。

## 六、Content-Disposition 详解

\`Content-Disposition\` 是控制浏览器"如何处理响应"的关键头。

\`\`\`python
# demo 8：Content-Disposition 的两种模式
from fastapi import FastAPI, Response
from fastapi.responses import FileResponse, StreamingResponse

app = FastAPI()

# 模式 1：inline（默认）——浏览器尝试显示
@app.get("/view/{filename}")
def view_file(filename: str):
    return FileResponse(
        path=f"/data/{filename}",
        # 不传 filename，或 headers 里设 Content-Disposition: inline
    )
# 图片会在浏览器里显示，PDF 会用阅读器打开

# 模式 2：attachment——强制下载
@app.get("/download/{filename}")
def download_file(filename: str):
    return FileResponse(
        path=f"/data/{filename}",
        filename=filename,  # 传 filename 自动设 attachment
    )
# 浏览器弹出下载框

# 手动设置 Content-Disposition（更灵活）
@app.get("/custom/{filename}")
def custom_download(filename: str):
    def gen():
        with open(f"/data/{filename}", "rb") as f:
            while chunk := f.read(8192):
                yield chunk
    return StreamingResponse(
        gen(),
        media_type="application/octet-stream",
        headers={
            # attachment 表示下载；filename 指定保存名
            # filename*= 支持 UTF-8 中文文件名（RFC 5987）
            "Content-Disposition": f"attachment; filename*=UTF-8''{filename}"
        }
    )
\`\`\`

\`Content-Disposition\` 的值：

- \`inline\`：浏览器内联显示（图片、文本、PDF 等能显示的就显示）。
- \`attachment; filename="xxx"\`：强制下载，保存为 xxx。
- \`attachment; filename*=UTF-8''中文文件名\`：支持中文文件名（用 RFC 5987 编码）。

中文文件名是个坑。直接写 \`filename="中文.txt"\` 在某些浏览器会乱码。正确做法是用 \`filename*=UTF-8''\` 编码：

\`\`\`python
# demo 9：中文文件名处理
from fastapi import FastAPI
from fastapi.responses import FileResponse
from urllib.parse import quote

app = FastAPI()

@app.get("/download-cn")
def download_chinese():
    filename = "用户数据.csv"
    # 用 quote 编码中文文件名
    encoded_filename = quote(filename)
    return FileResponse(
        path="/data/users.csv",
        filename=filename,  # FileResponse 内部会处理编码
        # 如果用 StreamingResponse，要手动编码：
        # headers={"Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"}
    )
\`\`\`

\`FileResponse\` 的 \`filename\` 参数会自动处理中文编码，所以优先用它。\`StreamingResponse\` 需要手动用 \`urllib.parse.quote\` 编码。

## 七、CSV 大报表导出实战

结合流式响应和 CSV 生成，实现大报表导出。

\`\`\`python
# demo 10：流式 CSV 导出
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import csv
import io
import time

app = FastAPI()

def generate_csv():
    # CSV 表头
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "用户名", "邮箱", "注册时间"])
    yield output.getvalue()
    output.seek(0)  # 清空缓冲区
    output.truncate(0)

    # 逐行生成数据
    for i in range(1, 100001):  # 10 万行
        writer.writerow([
            i,
            f"user_{i}",
            f"user_{i}@example.com",
            f"2024-01-{i % 30 + 1:02d}",
        ])
        yield output.getvalue()
        output.seek(0)
        output.truncate(0)
        # 每 1000 行 sleep 一下，模拟真实查询耗时
        if i % 1000 == 0:
            time.sleep(0.01)

@app.get("/export/users.csv")
def export_users():
    return StreamingResponse(
        generate_csv(),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=users.csv"
        }
    )

# 客户端会立即开始下载，不用等 10 万行全生成完
# 内存占用始终只有一行数据的大小
\`\`\`

这个方案的优势：

1. **内存友好**：始终只缓冲一行 CSV，10 万行也只占几 KB。
2. **即时响应**：客户端立即开始下载，不用等。
3. **可扩展**：数据源可以是数据库游标（cursor），逐行查询逐行 yield。

## 八、流式响应的注意事项

### 1. 异步生成器

如果生成器里有异步操作（如异步查数据库），用 \`async def\` 和 \`async yield\`。

\`\`\`python
# demo 11：异步流式响应
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio

app = FastAPI()

async def async_generate():
    for i in range(5):
        # 模拟异步操作（如查数据库）
        await asyncio.sleep(1)
        yield f"异步数据 {i}\\n"

@app.get("/async-stream")
async def async_stream():
    return StreamingResponse(
        async_generate(),
        media_type="text/plain",
    )
\`\`\`

异步生成器用 \`async def\` 定义，用 \`yield\` 产生数据。StreamingResponse 同时支持同步和异步生成器。

### 2. 错误处理

流式响应开始后，HTTP 头已经发送，此时生成器抛异常，客户端会收到截断的响应。无法再改状态码。

\`\`\`python
# demo 12：流式响应的错误处理
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

def risky_generate():
    yield "开始\\n"
    # 此时响应头已发送，状态码 200 已定
    raise Exception("出错了")  # 客户端会收到不完整的响应

@app.get("/risky")
def risky():
    # 正确做法：在生成器开始前做校验
    # 一旦开始 yield，就无法改变状态码了
    return StreamingResponse(risky_generate(), media_type="text/plain")

# 正确做法：先校验，再流式
def safe_generate():
    yield "安全数据\\n"

@app.get("/safe")
def safe():
    # 先检查前置条件
    # if not check_condition():
    #     raise HTTPException(400, "条件不满足")  # 这里还能改状态码
    return StreamingResponse(safe_generate(), media_type="text/plain")
\`\`\`

关键原则：**校验逻辑放在生成器外**。一旦生成器开始 yield，HTTP 响应头（含状态码）已发送，无法更改。如果有错误条件，应该在返回 StreamingResponse 之前检查。

### 3. 客户端断开

如果客户端中途断开连接（如关闭浏览器），生成器会被中断。FastAPI 会抛出 \`asyncio.CancelledError\`（异步）或 \`GeneratorExit\`（同步）。你可以在生成器里用 try/finally 清理资源。

\`\`\`python
# demo 13：处理客户端断开
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

def generate_with_cleanup():
    print("开始生成")
    try:
        for i in range(100):
            yield f"数据 {i}\\n"
    except GeneratorExit:
        # 客户端断开连接
        print("客户端断开了，停止生成")
        raise  # 重新抛出，让生成器正常关闭
    finally:
        # 无论正常结束还是中断，都清理资源
        print("清理资源")

@app.get("/resilient-stream")
def resilient_stream():
    return StreamingResponse(generate_with_cleanup(), media_type="text/plain")
\`\`\`

\`finally\` 块确保资源（文件句柄、数据库连接）被释放，即使客户端断开。

## 九、StreamingResponse vs FileResponse 选择

| 场景 | 推荐 | 原因 |
|------|------|------|
| 返回磁盘上的文件 | FileResponse | 自动处理分块、Content-Type、断点续传 |
| 实时数据流（日志、AI 回复） | StreamingResponse | 数据是动态生成的，不是文件 |
| 大文件自定义处理 | StreamingResponse | 需要自定义读取逻辑时 |
| CSV/报表导出 | StreamingResponse | 数据是生成的，配合 csv 模块 |
| 普通文件下载 | FileResponse | 最省心，一行代码搞定 |

口诀：**有文件用 FileResponse，没文件用 StreamingResponse**。

## 十、小结

- **StreamingResponse**：流式响应，接收生成器，边 yield 边发送。适合实时数据、大报表、动态内容。
  - 生成器用 \`yield\` 产生数据（bytes 或 str）。
  - \`media_type\` 设置内容类型。
  - 支持 sync 和 async 生成器。
- **FileResponse**：文件响应，自动处理分块读取、Content-Type 推断、断点续传。
  - \`path\` 指定文件，\`filename\` 触发下载。
  - 不传 \`filename\` 则浏览器尝试内联显示。
- **Content-Disposition**：\`attachment\` 强制下载，\`inline\` 内联显示。中文文件名用 \`filename*=UTF-8''\` 编码。
- **大文件下载**：分块读取（chunk_size 8KB-64KB），避免内存爆炸。
- **错误处理**：校验放生成器外，资源清理用 try/finally。

流式响应是处理大数据和实时数据的核心技术。掌握它，你的 API 就能优雅地处理从日志流到视频下载的各种场景。
`
  }
];
