// =============================================================
// FastAPI 应用开发实战教程 - 第 5 批章节（响应处理 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-response-model : 响应模型 response_model
//   fa-status-header  : 状态码与 Header
//   fa-cookie-session : Cookie 与 Session
//   fa-streaming      : 流式响应与文件下载
// ============================================================

export const chapters = [
  // ============================================================
  // 第 17 章：响应模型 response_model
  // ============================================================
  {
    id: "fa-response-model",
    group: "响应处理",
    icon: "📤",
    title: "响应模型 response_model",
    content: `# 响应模型 response_model

## 一、为什么需要响应模型

在 Web API 开发中，"返回什么数据给客户端"和"接收什么数据"同等重要。很多初学者写 FastAPI 时习惯直接 \`return dict\` 或 \`return orm_object\`，这种写法看似简单，却埋下了几个严重隐患：

1. **敏感字段泄漏**：数据库 User 表通常有 \`password\`、\`salt\`、\`is_deleted\` 等内部字段，直接返回 ORM 对象会把密码哈希也暴露给前端，这是典型的安全漏洞。
2. **没有类型契约**：调用方不知道返回结构里有哪些字段、什么类型，前端 IDE 没有提示，联调时反复确认字段名。
3. **API 文档空白**：OpenAPI 文档不知道响应结构，Swagger UI 显示不出 Responses 示例，文档形同虚设。
4. **多余字段返回**：数据库模型字段几十个，前端列表页只需要其中三五个，全量返回浪费带宽，也增加前端处理负担。
5. **返回结构不可控**：函数里返回什么前端就拿什么，后续要加字段、改字段都得小心，没有统一的"出口过滤"。

\`response_model\` 就是为解决这些问题设计的：它告诉 FastAPI「这个接口返回的数据应该长成什么样」，框架会按这个模型去**过滤、校验、序列化**实际返回值。可以把它理解为接口的"出口安检"——不管函数内部返回什么，到了出口只允许符合模型定义的字段通过。

## 二、response_model 的核心作用与原理

声明 \`response_model=SomeModel\` 后，FastAPI 会在响应返回前做三件事：

1. **过滤字段**：把返回值里多余的字段剔除，只保留模型定义的字段。这是防泄漏的核心机制。
2. **校验类型**：返回值会被模型重新校验，类型不对会报错（开发期就能发现，不会带到生产）。
3. **生成文档**：OpenAPI schema 自动记录响应结构，Swagger UI 显示示例。

底层原理：FastAPI 收到路由函数的返回值后，调用 Pydantic 模型的 \`model_validate()\`（v2）或 \`parse_obj()\`（v1）把返回值转换为模型实例，再调用 \`model_dump()\` / \`.dict()\` 序列化为 JSON。这中间"转换为模型实例"就是过滤过程——模型没定义的字段会被丢弃。

注意：**过滤是按字段名匹配，不是按对象类型**。返回的 dict、ORM 对象、Pydantic 实例都行，只要字段名能对上。

## 三、基础用法：UserOut 不返回 password

最经典的场景：接收 UserIn（含密码），处理后返回 UserOut（不含密码）。

\`\`\`python
# 从 fastapi 包导入 FastAPI 主类
from fastapi import FastAPI
# 从 pydantic 包导入 BaseModel 基类
from pydantic import BaseModel

# 创建 FastAPI 应用实例
app = FastAPI()

# 输入模型：包含密码（创建用户时前端必须传）
class UserIn(BaseModel):
    username: str        # 用户名，字符串类型
    password: str        # 明文密码（实际项目要 hash 后再存）
    email: str           # 邮箱

# 输出模型：不含密码，对外安全
class UserOut(BaseModel):
    username: str        # 用户名
    email: str           # 邮箱
    # 没有 password 字段 —— response_model 会自动把它过滤掉

# 模拟数据库（实际项目用 SQLAlchemy / Tortoise 等）
fake_db = {}

# response_model=UserOut：即使函数 return 了完整 dict，FastAPI 也只输出 UserOut 的字段
@app.post("/users", response_model=UserOut)
def create_user(user: UserIn):
    # 实际项目这里会 hash 密码再存
    fake_db[user.username] = user
    # 返回的是 UserIn 的所有字段（含 password），但 response_model 会过滤
    return user
\`\`\`

请求 \`POST /users\` 传 \`{"username":"alice","password":"123456","email":"a@b.com"}\`，响应只有：
\`\`\`
{"username":"alice","email":"a@b.com"}
\`\`\`
\`password\` 被自动剔除了。这就是 response_model 的过滤作用。

## 四、为什么不用 dict 直接返回

对比两种写法：

| 维度 | \`return dict\` | \`response_model=Model\` |
|---|---|---|
| 敏感字段过滤 | 手动删字段，容易漏 | 自动过滤，安全 |
| 类型校验 | 无，返回啥是啥 | 自动校验 |
| API 文档 | 没有响应结构 | 自动生成 |
| IDE 提示 | 无 | 有类型提示 |
| 字段变更影响 | 不可控 | 受模型约束 |

\`response_model\` 还有一个隐性好处：**它解耦了内部数据结构和外部契约**。内部你可以随意改数据库模型字段，只要 response_model 不变，前端就不受影响。

## 五、response_model_exclude / response_model_include

有时候同一个接口在不同场景下需要返回不同字段子集。比如用户列表页只要 \`id\` 和 \`username\`，详情页要全部字段。除了定义多个模型，还可以用 \`response_model_include\` 和 \`response_model_exclude\` 在路由级别动态裁剪。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建应用
app = FastAPI()

# 完整用户模型
class User(BaseModel):
    id: int               # 用户 ID
    username: str         # 用户名
    email: str            # 邮箱
    password: str         # 密码哈希（内部字段）
    is_active: bool       # 是否激活
    created_at: str       # 创建时间

# 模拟数据
fake_user = User(
    id=1,
    username="alice",
    email="alice@example.com",
    password="hashed_secret",
    is_active=True,
    created_at="2026-01-01"
)

# 列表接口：只包含 id 和 username（白名单方式）
@app.get("/users", response_model=User, response_model_include={"id", "username"})
def list_users():
    # response_model_include 指定只输出这两个字段
    return fake_user

# 详情接口：排除 password（黑名单方式）
@app.get("/users/{user_id}", response_model=User, response_model_exclude={"password"})
def get_user(user_id: int):
    # response_model_exclude 指定排除 password 字段
    return fake_user

# 调试接口：什么都不过滤（不推荐生产用）
@app.get("/users-raw", response_model=User)
def get_user_raw():
    # 没有 include/exclude，返回 User 模型所有字段
    return fake_user
\`\`\`

- 访问 \`GET /users\` → \`{"id":1,"username":"alice"}\`
- 访问 \`GET /users/1\` → \`{"id":1,"username":"alice","email":"alice@example.com","is_active":true,"created_at":"2026-01-01"}\`（没有 password）
- 访问 \`GET /users-raw\` → 含 password（不安全，仅演示）

**include 和 exclude 互斥**，不要同时用。它们接收的是字段名的集合（set 或 list）。

> 生产建议：能用独立模型就用独立模型，include/exclude 适合临时场景或字段极多的模型做局部裁剪。频繁用会让代码可读性下降。

## 六、response_model_exclude_unset / exclude_defaults / exclude_none

这三个参数控制"默认值字段是否输出"，在 PATCH（部分更新）场景特别有用。

- \`response_model_exclude_unset=True\`：客户端**没传**的字段不输出（只输出显式设置的字段）。
- \`response_model_exclude_defaults=True\`：值等于模型默认值的字段不输出。
- \`response_model_exclude_none=True\`：值为 \`None\` 的字段不输出。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel 和 Field
from pydantic import BaseModel, Field

# 创建应用
app = FastAPI()

# 商品模型，部分字段有默认值
class Item(BaseModel):
    name: str                          # 名称，必填
    description: str | None = None     # 描述，可选，默认 None
    price: float = 0.0                 # 价格，默认 0.0
    tax: float = 0.0                   # 税率，默认 0.0
    tags: list[str] = []               # 标签，默认空列表

# 模拟数据库
items = {
    "foo": {"name": "Foo", "price": 50.5, "description": "商品 Foo"},  # 没传 tax 和 tags
    "bar": {"name": "Bar", "price": 30.0, "tax": 3.2},                 # 没传 description 和 tags
}

# 不排除任何字段：所有字段都输出（包括默认值）
@app.get("/items/{item_id}", response_model=Item)
def read_item(item_id: str):
    return items[item_id]

# exclude_unset：只输出客户端显式传过的字段
@app.get("/items-unset/{item_id}", response_model=Item, response_model_exclude_unset=True)
def read_item_unset(item_id: str):
    return items[item_id]

# exclude_none：值为 None 的字段不输出
@app.get("/items-none/{item_id}", response_model=Item, response_model_exclude_none=True)
def read_item_none(item_id: str):
    return items[item_id]

# 组合使用：既排除未设置的，又排除 None
@app.get("/items-strict/{item_id}", response_model=Item,
         response_model_exclude_unset=True, response_model_exclude_none=True)
def read_item_strict(item_id: str):
    return items[item_id]
\`\`\`

以 \`items["foo"]\` 为例（只设了 name/price/description）：

- \`GET /items/foo\` → \`{"name":"Foo","description":"商品 Foo","price":50.5,"tax":0.0,"tags":[]}\`（全部输出）
- \`GET /items-unset/foo\` → \`{"name":"Foo","price":50.5,"description":"商品 Foo"}\`（tax 和 tags 没设，不输出）
- \`GET /items-none/foo\` → \`{"name":"Foo","description":"商品 Foo","price":50.5,"tax":0.0,"tags":[]}\`（没有 None 字段，所以都输出）

**关键区别**：\`exclude_unset\` 看的是"创建对象时有没有传这个字段"，\`exclude_defaults\` 看的是"当前值是否等于默认值"，\`exclude_none\` 看的是"值是否为 None"。三者侧重不同，按场景选。

## 七、response_model 嵌套模型

实际项目数据通常是嵌套结构：用户包含地址，订单包含商品列表。response_model 完全支持嵌套，过滤会递归进行。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建应用
app = FastAPI()

# 内层模型：地址（输出用，不含 user_id 等内部字段）
class AddressOut(BaseModel):
    city: str            # 城市
    street: str          # 街道
    zip_code: str        # 邮编

# 内层模型：地址（输入用，含 user_id 用于关联）
class AddressIn(BaseModel):
    user_id: int         # 关联用户 ID（内部字段，不对外）
    city: str            # 城市
    street: str          # 街道
    zip_code: str        # 邮编

# 外层输出模型：用户 + 地址列表
class UserWithAddress(BaseModel):
    id: int                       # 用户 ID
    username: str                 # 用户名
    addresses: list[AddressOut]   # 地址列表，用输出模型，自动过滤 user_id

# 模拟数据库返回的原始数据（含敏感字段）
raw_data = {
    "id": 1,
    "username": "alice",
    "password": "should_be_filtered",   # 应被过滤
    "addresses": [
        {"user_id": 1, "city": "北京", "street": "长安街 1 号", "zip_code": "100000"},
        {"user_id": 1, "city": "上海", "street": "南京路 100 号", "zip_code": "200000"},
    ]
}

# response_model 会递归过滤：外层过滤 password，内层过滤每个 address 的 user_id
@app.get("/users/{user_id}", response_model=UserWithAddress)
def get_user(user_id: int):
    return raw_data
\`\`\`

响应：
\`\`\`json
{
  "id": 1,
  "username": "alice",
  "addresses": [
    {"city": "北京", "street": "长安街 1 号", "zip_code": "100000"},
    {"city": "上海", "street": "南京路 100 号", "zip_code": "200000"}
  ]
}
\`\`\`

\`password\` 和每个 \`address.user_id\` 都被过滤了。嵌套模型让"分层过滤"变得自然——每一层用各自的输出模型，互不干扰。

## 八、输入模型 vs 输出模型的设计模式

这是 FastAPI 项目最推荐的数据建模模式：**为每个接口的"输入"和"输出"分别定义模型**，而不是一个模型走天下。

常见模型分类：
- \`UserCreate\`：创建用户时的输入（含 password）
- \`UserUpdate\`：更新用户时的输入（所有字段可选，用于 PATCH）
- \`UserOut\`：对外输出（不含 password、is_deleted 等）
- \`UserInDB\`：数据库存储（含 hashed_password）

\`\`\`python
# 从 fastapi 导入 FastAPI 和 HTTPException
from fastapi import FastAPI, HTTPException
# 从 pydantic 导入 BaseModel 和 Field
from pydantic import BaseModel, Field

# 创建应用
app = FastAPI()

# 创建用户输入模型（前端提交）
class UserCreate(BaseModel):
    # Field(...) 第一个参数 ... 表示必填（不能省略）
    # min_length=3 最少 3 字符，max_length=20 最多 20 字符
    username: str = Field(..., min_length=3, max_length=20)   # 用户名，3-20 字符
    # min_length=6 密码至少 6 位，防止弱密码
    password: str = Field(..., min_length=6)                  # 密码，至少 6 位
    email: str                                                # 邮箱

# 更新用户输入模型（PATCH，所有字段可选）
# PATCH 语义是"部分更新"，所以所有字段都要可选（默认 None）
# 这样客户端只传需要改的字段，没传的字段保持原值
class UserUpdate(BaseModel):
    username: str | None = None       # 用户名，可选（str | None 表示可以是字符串或 None）
    email: str | None = None          # 邮箱，可选
    password: str | None = None       # 新密码，可选

# 数据库存储模型（含哈希密码）
class UserInDB(BaseModel):
    id: int                           # 主键，整数类型
    username: str                     # 用户名
    email: str                        # 邮箱
    hashed_password: str              # 哈希后的密码（不对外暴露）
    is_active: bool = True            # 是否激活，默认 True

# 对外输出模型（不含任何敏感字段）
class UserOut(BaseModel):
    id: int                           # 用户 ID
    username: str                     # 用户名
    email: str                        # 邮箱
    is_active: bool                   # 是否激活
    # 注意：没有 hashed_password 字段，response_model 会自动过滤掉

# 模拟数据库：键是用户 ID，值是 UserInDB 实例
db: dict[int, UserInDB] = {}
next_id = 1  # 自增 ID，模拟数据库的自增主键

# 创建用户：输入 UserCreate，输出 UserOut
# status_code=201 表示资源创建成功（RESTful 规范）
@app.post("/users", response_model=UserOut, status_code=201)
def create_user(user: UserCreate):
    # 声明使用全局变量 next_id（否则 Python 会把它当局部变量）
    global next_id
    # 模拟密码哈希（实际用 passlib.context.CryptContext）
    # 哈希后即使数据库泄漏，攻击者也拿不到明文密码
    hashed = "hashed_" + user.password
    # 构造数据库模型实例
    db_user = UserInDB(
        id=next_id,                   # 分配新 ID
        username=user.username,       # 从输入模型取用户名
        email=user.email,             # 从输入模型取邮箱
        hashed_password=hashed,       # 存哈希后的密码
        is_active=True                # 新用户默认激活
    )
    db[next_id] = db_user             # 存入"数据库"
    next_id += 1                      # ID 自增，为下一个用户准备
    # 返回 db_user，response_model=UserOut 会自动过滤 hashed_password
    # 即使返回的对象里有 hashed_password，客户端也收不到
    return db_user

# 查询用户：输出 UserOut
@app.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int):
    # 用户不存在则 404
    if user_id not in db:
        raise HTTPException(status_code=404, detail="用户不存在")
    # 返回数据库实例，response_model 过滤敏感字段
    return db[user_id]

# 更新用户：输入 UserUpdate，输出 UserOut
@app.patch("/users/{user_id}", response_model=UserOut)
def update_user(user_id: int, user: UserUpdate):
    # 用户不存在则 404
    if user_id not in db:
        raise HTTPException(status_code=404, detail="用户不存在")
    # 取出当前存储的用户
    stored = db[user_id]
    # 只更新客户端传了的字段（exclude_unset 排除未传的）
    # model_dump() 把 Pydantic 模型转成 dict
    # exclude_unset=True 只保留客户端显式设置的字段，没传的字段（用默认值的）不包含
    update_data = user.model_dump(exclude_unset=True)
    # 用新数据构造更新后的对象
    # model_copy(update=...) 是 Pydantic v2 的方法，类似 .copy(update=...)
    # 它创建一个新实例，用 update_data 里的字段覆盖原值
    updated = stored.model_copy(update=update_data)
    db[user_id] = updated             # 写回数据库
    return updated
\`\`\`

这种设计的好处：
1. **安全**：\`hashed_password\` 永远不会通过 API 泄漏，因为所有接口的 response_model 都是 \`UserOut\`。
2. **清晰**：每个模型的字段反映了"这一步需要什么"，读代码就知道接口契约。
3. **灵活**：\`UserUpdate\` 字段全可选，支持部分更新；\`UserCreate\` 字段必填，保证数据完整。
4. **可演进**：以后给 \`UserOut\` 加字段不影响 \`UserCreate\`，给 \`UserCreate\` 加字段不影响 \`UserOut\`。

## 九、response_model 与 async def

\`response_model\` 与 \`async def\` 完全兼容，用法一模一样。FastAPI 内部会判断函数是否是协程函数，自动用 \`await\` 调用，但 response_model 的过滤逻辑对同步/异步函数一视同仁。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建应用
app = FastAPI()

# 输出模型
class ProductOut(BaseModel):
    id: int              # 商品 ID
    name: str            # 商品名
    price: float         # 价格

# 异步函数 + response_model：完全兼容
@app.get("/products/{product_id}", response_model=ProductOut)
async def get_product(product_id: int):
    # 模拟异步数据库查询
    # 实际项目：product = await db.products.get(product_id)
    return {"id": product_id, "name": "异步商品", "price": 99.9}

# 同步函数 + response_model：也完全兼容
@app.get("/products-sync/{product_id}", response_model=ProductOut)
def get_product_sync(product_id: int):
    # 同步函数同样支持 response_model
    return {"id": product_id, "name": "同步商品", "price": 88.8}

# 即使返回的是 dict（不是模型实例），response_model 也会过滤+校验
@app.get("/products-extra/{product_id}", response_model=ProductOut)
async def get_product_extra(product_id: int):
    # 返回的 dict 多了 stock 字段，但 ProductOut 没定义，会被过滤
    return {"id": product_id, "name": "带额外字段", "price": 77.7, "stock": 100}
\`\`\`

三个接口返回的都是 \`{"id":...,"name":...,"price":...}\`，多出的 \`stock\` 被过滤。

**性能提示**：response_model 会带来一次额外的 Pydantic 序列化开销。对极致性能场景（如高频接口），可以用 \`response_model=None\` 关闭，但要确保返回值已经安全。

## 十、response_model=None 关闭过滤

某些场景下你想完全控制返回值，不让 FastAPI 过滤。比如返回的是动态结构（聚合统计、报表数据），字段不固定。这时用 \`response_model=None\`。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI

# 创建应用
app = FastAPI()

# 动态统计接口：字段不固定，关闭 response_model
@app.get("/dashboard", response_model=None)
async def dashboard():
    # 返回任意结构，FastAPI 不做过滤
    return {
        "total_users": 1024,
        "active_today": 256,
        "revenue": 9999.5,
        "trend": [10, 20, 30, 40, 50],   # 数组也行
        "metadata": {"version": "v2", "note": "动态字段"}  # 嵌套也行
    }

# 注意：response_model=None 时 OpenAPI 文档里这个接口的响应会标记为任意类型
# 适合内部接口或动态数据，对外接口不建议
\`\`\`

## 十一、实战：完整的用户 API（UserCreate 输入、UserResponse 输出）

把前面所有知识点串起来，做一个接近生产水准的用户 API。

\`\`\`python
# 从 fastapi 导入 FastAPI、HTTPException、status
from fastapi import FastAPI, HTTPException, status
# 从 pydantic 导入 BaseModel、Field、EmailStr
from pydantic import BaseModel, Field, EmailStr

# 创建应用
app = FastAPI(title="用户管理 API")

# ============ 数据模型定义 ============

# 创建用户：输入模型
class UserCreate(BaseModel):
    # Field(...) 第一个参数 ... 表示必填
    # min_length/max_length 限制长度范围
    # description 写进 OpenAPI 文档，供前端参考
    username: str = Field(..., min_length=3, max_length=20, description="用户名")
    password: str = Field(..., min_length=6, description="密码，至少 6 位")
    # EmailStr 是 pydantic 的邮箱类型，自动校验格式（如 a@b.com）
    email: EmailStr                              # 邮箱，自动校验格式
    # 默认 None 表示可选，前端不传则存 None
    full_name: str | None = Field(None, description="全名，可选")

# 更新用户：输入模型（全部可选）
# PATCH 语义是部分更新，所以字段都要可选
class UserUpdate(BaseModel):
    # 所有字段默认 None，客户端只传需要改的字段
    username: str | None = Field(None, min_length=3, max_length=20)
    email: EmailStr | None = None
    full_name: str | None = None

# 用户输出：对外模型（不含密码）
class UserResponse(BaseModel):
    id: int                                       # 用户 ID
    username: str                                 # 用户名
    email: str                                    # 邮箱
    full_name: str | None                         # 全名，可能为 None
    is_active: bool                               # 是否激活

# 数据库存储模型（含哈希密码）
class UserInDB(BaseModel):
    id: int                       # 主键 ID
    username: str                 # 用户名
    email: str                    # 邮箱
    full_name: str | None         # 全名
    hashed_password: str          # 哈希后的密码（不对外暴露）
    is_active: bool = True        # 是否激活，新用户默认 True

# ============ 模拟数据库 ============
db: dict[int, UserInDB] = {}
next_id = 1

# ============ 接口实现 ============

# 创建用户：201 状态码，返回 UserResponse
# status_code=status.HTTP_201_CREATED 表示资源创建成功（RESTful 规范）
@app.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
    # 声明使用全局变量 next_id（否则 Python 把它当局部变量）
    global next_id
    # 检查用户名是否已存在（遍历模拟数据库）
    for u in db.values():
        if u.username == user.username:
            # 用户名重复返回 400 Bad Request
            raise HTTPException(status_code=400, detail="用户名已存在")
    # 哈希密码（实际用 passlib 的 CryptContext）
    # 这里用简单前缀模拟，实际项目要用 bcrypt/scrypt
    hashed = "hashed_" + user.password
    # 构造数据库模型实例存入"数据库"
    db_user = UserInDB(
        id=next_id,                   # 分配新 ID
        username=user.username,       # 从输入模型取用户名
        email=user.email,             # 从输入模型取邮箱
        full_name=user.full_name,     # 从输入模型取全名
        hashed_password=hashed,       # 存哈希后的密码
        is_active=True                # 新用户默认激活
    )
    db[next_id] = db_user             # 存入字典模拟数据库
    next_id += 1                      # ID 自增，为下一个用户准备
    # 返回 db_user，response_model=UserResponse 会过滤掉 hashed_password
    return db_user

# 查询单个用户
@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    # user_id 从 URL 路径解析
    if user_id not in db:
        # 不存在返回 404
        raise HTTPException(status_code=404, detail="用户不存在")
    # 返回数据库实例，response_model 过滤敏感字段
    return db[user_id]

# 用户列表：response_model=list[UserResponse] 表示返回数组
@app.get("/users", response_model=list[UserResponse])
async def list_users():
    # db.values() 返回所有用户，list() 转成列表
    return list(db.values())

# 更新用户（PATCH 部分更新）
@app.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user: UserUpdate):
    if user_id not in db:
        raise HTTPException(status_code=404, detail="用户不存在")
    # 取出当前存储的用户
    stored = db[user_id]
    # exclude_unset=True：只取客户端实际传了的字段
    # model_dump() 把 Pydantic 模型转成 dict
    update_data = user.model_dump(exclude_unset=True)
    # 检查用户名冲突（如果要改用户名）
    if "username" in update_data:
        for uid, u in db.items():
            # 排除自己，检查其他用户是否占用该用户名
            if uid != user_id and u.username == update_data["username"]:
                raise HTTPException(status_code=400, detail="用户名已被占用")
    # 应用更新：model_copy 创建新实例，用 update_data 覆盖原值
    updated = stored.model_copy(update=update_data)
    db[user_id] = updated             # 写回数据库
    return updated

# 删除用户：204 No Content
@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int):
    if user_id not in db:
        raise HTTPException(status_code=404, detail="用户不存在")
    del db[user_id]                   # 从数据库删除
    # 204 不应返回 body，return None 即可
    return None
\`\`\`

这套 API 体现了 response_model 的完整实践：
- 输入用 \`UserCreate\` / \`UserUpdate\`，输出用 \`UserResponse\`，存储用 \`UserInDB\`，职责分离。
- \`hashed_password\` 永远不会出现在响应里。
- 列表接口用 \`response_model=list[UserResponse]\` 表示返回数组。
- PATCH 用 \`exclude_unset\` 实现部分更新。
- 删除接口用 \`204 No Content\`，不返回 body。

## 十二、response_model 使用清单

| 场景 | 推荐做法 |
|---|---|
| 防止敏感字段泄漏 | 定义不含敏感字段的 \`XxxOut\` 模型，设为 response_model |
| 同模型不同字段 | \`response_model_include\` / \`response_model_exclude\` |
| PATCH 部分更新 | \`response_model_exclude_unset=True\` |
| 可选字段不输出 | \`response_model_exclude_none=True\` |
| 嵌套数据 | 内层和外层各定义输出模型，response_model 递归过滤 |
| 动态返回结构 | \`response_model=None\` 关闭过滤 |
| 列表响应 | \`response_model=list[ItemOut]\` |
| 极致性能 | 手动控制返回值 + \`response_model=None\` |

记住一个原则：**任何对外接口都应该声明 response_model**，除非有特殊理由。这是 FastAPI 项目的基本卫生习惯。
`
  },

  // ============================================================
  // 第 18 章：状态码与 Header
  // ============================================================
  {
    id: "fa-status-header",
    group: "响应处理",
    icon: "📊",
    title: "状态码与 Header",
    content: `# 状态码与 Header

## 一、HTTP 状态码详解

HTTP 状态码（Status Code）是响应行中的三位数字，表示请求的处理结果。理解状态码是设计 RESTful API 的基础。状态码按首位分为五大类：

| 类别 | 范围 | 含义 | 典型场景 |
|---|---|---|---|
| 1xx | 100-199 | 信息性 | WebSocket 升级、Continue |
| 2xx | 200-299 | 成功 | 200 OK、201 Created、204 No Content |
| 3xx | 300-399 | 重定向 | 301 永久跳转、302 临时跳转、304 Not Modified |
| 4xx | 400-499 | 客户端错误 | 400 Bad Request、401 Unauthorized、403 Forbidden、404 Not Found、422 Unprocessable |
| 5xx | 500-599 | 服务端错误 | 500 Internal Error、502 Bad Gateway、503 Service Unavailable |

FastAPI 中常用的状态码：

- **200 OK**：默认值，请求成功。
- **201 Created**：资源创建成功，POST 创建资源时用。
- **204 No Content**：成功但无内容返回，DELETE 常用。
- **301 Moved Permanently**：永久重定向。
- **302 Found**：临时重定向。
- **304 Not Modified**：资源未修改（配合缓存）。
- **400 Bad Request**：请求参数错误。
- **401 Unauthorized**：未认证（没登录或 token 无效）。
- **403 Forbidden**：已认证但无权限。
- **404 Not Found**：资源不存在。
- **409 Conflict**：冲突（如用户名已存在）。
- **422 Unprocessable Entity**：FastAPI 默认的校验失败状态码。
- **500 Internal Server Error**：服务端内部错误。

FastAPI 在 \`fastapi.status\` 模块里提供了所有状态码的常量，建议用常量而非魔法数字。

## 二、status_code 设置方式

### 2.1 路由装饰器设置默认状态码

最简单的方式是在 \`@app.post()\` 等装饰器里传 \`status_code\`。

\`\`\`python
# 从 fastapi 导入 FastAPI 和 status 模块
from fastapi import FastAPI, status
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建应用
app = FastAPI()

# 任务模型
class Task(BaseModel):
    id: int               # 任务 ID
    title: str            # 任务标题
    done: bool = False    # 是否完成

# 模拟数据库
tasks: dict[int, Task] = {}
next_id = 1

# 创建任务：201 Created
# status_code=status.HTTP_201_CREATED 表示资源创建成功
# 用常量而非数字 201 更可读，IDE 也能自动补全
@app.post("/tasks", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(task: Task):
    global next_id                        # 声明使用全局变量
    task.id = next_id                     # 分配 ID
    tasks[next_id] = task                 # 存入数据库
    next_id += 1                          # ID 自增
    return task

# 删除任务：204 No Content
# 204 表示成功但无内容返回（DELETE 常用，客户端只关心成功与否）
@app.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int):
    if task_id in tasks:
        del tasks[task_id]                # 从数据库删除
    # 204 不应返回 body
    return None

# 普通查询：默认 200
@app.get("/tasks/{task_id}", response_model=Task)
def get_task(task_id: int):
    return tasks[task_id]
\`\`\`

\`status_code\` 接受整数或 \`fastapi.status\` 常量。用常量更可读，IDE 也能自动补全。

### 2.2 用 Response 对象动态设置状态码

有时状态码不能在装饰器里写死，要根据运行时情况返回不同状态码。这时用 \`Response\` 参数动态设置。

\`\`\`python
# 从 fastapi 导入 FastAPI、Response、status
from fastapi import FastAPI, Response, status

# 创建应用
app = FastAPI()

# 模拟资源查找
def find_item(item_id: int):
    # 实际项目查数据库
    if item_id == 1:
        return {"id": 1, "name": "found"}
    return None

# 动态状态码：找到了 200，没找到 404
@app.get("/items/{item_id}")
def get_item(item_id: int, response: Response):
    item = find_item(item_id)
    if item is None:
        # 动态设置 404
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"error": "未找到"}
    # 默认 200
    return item

# 条件性 201：如果资源是新创建的返回 201，否则 200
@app.put("/items/{item_id}")
def upsert_item(item_id: int, response: Response):
    existed = find_item(item_id)
    if existed is None:
        # 新建
        response.status_code = status.HTTP_201_CREATED
        return {"id": item_id, "name": "新建"}
    # 更新
    response.status_code = status.HTTP_200_OK
    return {"id": item_id, "name": "更新"}
\`\`\`

把 \`Response\` 声明为参数后，FastAPI 注入当前响应对象，修改 \`status_code\` 即可。这种"upsert"模式（存在则更新，不存在则创建）在 RESTful API 里很常见。

## 三、自定义响应头 Header

响应头（Response Header）携带响应的元信息，如 \`Content-Type\`、\`Content-Length\`、\`Cache-Control\`、自定义的 \`X-Request-Id\` 等。

### 3.1 通过 Response 对象设置响应头

\`\`\`python
# 从 fastapi 导入 FastAPI、Response
from fastapi import FastAPI, Response
# 导入 uuid 用于生成请求 ID
import uuid

# 创建应用
app = FastAPI()

# 设置自定义响应头
@app.get("/hello")
def hello(response: Response):
    # 给每个响应加一个唯一的 X-Request-Id
    response.headers["X-Request-Id"] = str(uuid.uuid4())
    # 设置缓存控制
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    # 自定义业务头
    response.headers["X-Processed-At"] = "2026-07-11T12:00:00Z"
    return {"message": "hello"}

# 直接返回 Response 对象（完全控制）
from fastapi.responses import JSONResponse

@app.get("/custom")
def custom():
    # 直接构造 JSONResponse，同时设置状态码和头
    return JSONResponse(
        status_code=200,
        content={"message": "custom response"},
        headers={
            "X-Custom-Header": "my-value",
            "X-Version": "1.0.0",
        }
    )
\`\`\`

\`response.headers\` 是一个类似字典的对象，直接赋值即可。响应头名不区分大小写，但惯例是 \`X-\` 前缀的用首字母大写驼峰（\`X-Request-Id\`）。

### 3.2 设置响应头的常见场景

- **追踪**：\`X-Request-Id\` 贯穿请求链路，便于日志排查。
- **缓存**：\`Cache-Control\`、\`ETag\`、\`Last-Modified\`。
- **限流**：\`X-RateLimit-Limit\`、\`X-RateLimit-Remaining\`。
- **分页**：\`X-Total-Count\`、\`X-Page\`。
- **版本**：\`X-API-Version\`。

## 四、Header() 获取请求头

\`Header()\` 依赖用于从请求头读取值，用法类似 \`Query()\` 和 \`Path()\`。

\`\`\`python
# 从 fastapi 导入 FastAPI 和 Header
from fastapi import FastAPI, Header

# 创建应用
app = FastAPI()

# 读取单个请求头
@app.get("/header-demo")
def header_demo(
    # Header() 声明从请求头读 user_agent
    # None 表示可选（没传时返回 None）
    # alias="User-Agent" 指定实际的头名（因为 Python 参数名不能用连字符）
    user_agent: str | None = Header(None, alias="User-Agent"),
    # 注意：请求头名通常有连字符，Python 参数名不能用连字符
    # 用 alias 指定实际的头名
    x_token: str | None = Header(None, alias="X-Token"),
):
    return {
        "user_agent": user_agent,
        "x_token": x_token,
    }

# 必填请求头
@app.get("/auth")
def auth_check(
    # 必填的 Authorization 头
    # ... 表示必填，没传这个头会自动返回 422 错误
    authorization: str = Header(..., alias="Authorization"),
):
    # 简单校验：Bearer Token 格式应该是 "Bearer <token>"
    if not authorization.startswith("Bearer "):
        return {"error": "无效的认证头"}
    # authorization[7:] 去掉 "Bearer " 前缀（"Bearer " 正好 7 个字符）
    token = authorization[7:]  # 去掉 "Bearer " 前缀
    return {"token": token}

# 读取多个同名头（如多个 Set-Cookie 或 X-Forwarded-For）
@app.get("/multi")
def multi_header(
    # convert_underscores=False 保留下划线（默认会把下划线转连字符）
    # list[str] 类型声明表示这个头可以出现多次，收集成列表
    x_forwarded_for: list[str] | None = Header(None, alias="X-Forwarded-For"),
):
    return {"x_forwarded_for": x_forwarded_for}
\`\`\`

**重要细节**：
- \`Header()\` 默认会把参数名的下划线 \`_\` 转成连字符 \`-\`，因为 HTTP 头惯例用连字符。所以 \`user_agent\` 实际匹配 \`User-Agent\`。但更推荐用 \`alias\` 显式指定，避免歧义。
- \`convert_underscores=False\` 可以关闭这个转换。
- 头名不区分大小写，但 alias 写规范形式更清晰。

## 五、常用 Header 详解

### 5.1 Content-Type

\`Content-Type\` 表示请求/响应体的媒体类型。FastAPI 根据这个头决定如何解析请求体。

\`\`\`python
# 从 fastapi 导入 FastAPI、Request
from fastapi import FastAPI, Request
# 从 fastapi.responses 导入各种响应类型
from fastapi.responses import JSONResponse, PlainTextResponse, HTMLResponse

# 创建应用
app = FastAPI()

# FastAPI 默认用 application/json 解析请求体
@app.post("/json")
async def read_json(request: Request):
    # 读取 JSON 请求体
    data = await request.json()
    return {"received": data}

# 返回不同 Content-Type 的响应
@app.get("/text", response_class=PlainTextResponse)
def get_text():
    # Content-Type: text/plain; charset=utf-8
    return "这是一段纯文本"

@app.get("/html", response_class=HTMLResponse)
def get_html():
    # Content-Type: text/html; charset=utf-8
    return "<h1>你好</h1><p>这是 HTML</p>"

@app.get("/json-response")
def get_json():
    # 默认 JSONResponse，Content-Type: application/json
    return {"message": "JSON"}
\`\`\`

### 5.2 Authorization

\`Authorization\` 头用于携带认证信息，最常见的是 Bearer Token（JWT）。

\`\`\`python
# 从 fastapi 导入 FastAPI、Header、HTTPException、status
from fastapi import FastAPI, Header, HTTPException, status

# 创建应用
app = FastAPI()

# 模拟有效 token
VALID_TOKEN = "abc123secret"

# 通过 Header 读取 Authorization
@app.get("/me")
def get_me(authorization: str = Header(..., alias="Authorization")):
    # 校验 Bearer 格式
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="认证格式错误，应为 Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = authorization[7:]
    if token != VALID_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="token 无效",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"user": "alice", "token": token}
\`\`\`

\`HTTPException\` 的 \`headers\` 参数可以给错误响应附加头，\`WWW-Authenticate\` 是 401 响应的标准头，告诉客户端用什么认证方案。

### 5.3 X-Request-ID 请求追踪

给每个请求分配唯一 ID，贯穿日志、响应、下游调用，是分布式系统排错的标配。

\`\`\`python
# 从 fastapi 导入 FastAPI、Header、Request、Response
from fastapi import FastAPI, Header, Request, Response
# 导入 uuid
import uuid

# 创建应用
app = FastAPI()

# 中间件：给每个请求生成 X-Request-Id
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    # 优先复用客户端传的 ID，没有就生成新的
    request_id = request.headers.get("X-Request-Id", str(uuid.uuid4()))
    # 调用下游
    response = await call_next(request)
    # 在响应头里也带上，便于客户端关联
    response.headers["X-Request-Id"] = request_id
    return response

# 接口里也能读这个 ID
@app.get("/trace")
def trace(x_request_id: str | None = Header(None, alias="X-Request-Id")):
    return {"request_id": x_request_id, "message": "请求已追踪"}
\`\`\`

## 六、自定义 X- 前缀头

自定义业务头约定用 \`X-\` 前缀（虽然 RFC 6648 不再强制，但业界仍普遍使用）。

\`\`\`python
# 从 fastapi 导入 FastAPI、Header、Response
from fastapi import FastAPI, Header, Response

# 创建应用
app = FastAPI()

# 自定义版本头和客户端标识头
@app.get("/api/data")
def get_data(
    response: Response,
    # 客户端版本
    x_client_version: str | None = Header(None, alias="X-Client-Version"),
    # 客户端平台
    x_client_platform: str | None = Header(None, alias="X-Client-Platform"),
):
    # 在响应头里返回服务端版本
    response.headers["X-Server-Version"] = "2.1.0"
    response.headers["X-Response-Time"] = "15ms"
    return {
        "data": "some data",
        "client_version": x_client_version,
        "client_platform": x_client_platform,
    }
\`\`\`

## 七、实战：通过 Header 实现 API 版本控制

API 版本控制有三种常见方式：URL 路径（\`/v1/users\`）、查询参数（\`?version=1\`）、请求头（\`X-API-Version: 1\`）。下面实现 Header 方式。

\`\`\`python
# 从 fastapi 导入 FastAPI、Header、HTTPException、status、Request
from fastapi import FastAPI, Header, HTTPException, status, Request
# 从 fastapi.responses 导入 JSONResponse
from fastapi.responses import JSONResponse
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建应用
app = FastAPI()

# ============ v1 和 v2 的数据模型 ============

class UserV1(BaseModel):
    id: int                    # 用户 ID
    name: str                  # 名字（v1 用 name）
    email: str                 # 邮箱

class UserV2(BaseModel):
    id: int                    # 用户 ID
    username: str              # 用户名（v2 改用 username）
    email: str                 # 邮箱
    full_name: str | None      # v2 新增 full_name
    avatar: str | None         # v2 新增 avatar

# ============ 模拟数据 ============
# v1 和 v2 用不同的数据结构（字段不同）
# 实际项目里可能是同一张表，接口层做字段映射
users_v1 = {1: UserV1(id=1, name="alice", email="a@b.com")}
users_v2 = {1: UserV2(id=1, username="alice", email="a@b.com", full_name="Alice Liddell", avatar=None)}

# ============ 版本控制中间件 ============
# 支持的版本（用 set 查找快，O(1)）
SUPPORTED_VERSIONS = {"1", "2"}

@app.middleware("http")
async def version_middleware(request: Request, call_next):
    # 从请求头读版本，默认 "1"（兼容老客户端）
    version = request.headers.get("X-API-Version", "1")  # 默认 v1
    # 不支持的版本返回 400
    if version not in SUPPORTED_VERSIONS:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": f"不支持的 API 版本: {version}"},
        )
    # 把版本号塞进 request.state，后续路由能读
    # request.state 是请求级共享对象，中间件和路由都能访问
    request.state.api_version = version
    # 响应头标注当前版本（让客户端知道用了哪个版本）
    response = await call_next(request)
    response.headers["X-API-Version"] = version
    return response

# ============ 路由：根据版本返回不同结构 ============

@app.get("/users/{user_id}")
def get_user(user_id: int, request: Request):
    version = request.state.api_version   # 从中间件读版本
    if version == "1":
        if user_id not in users_v1:
            raise HTTPException(status_code=404, detail="用户不存在")
        return users_v1[user_id]          # 返回 v1 结构
    else:  # version == "2"
        if user_id not in users_v2:
            raise HTTPException(status_code=404, detail="用户不存在")
        return users_v2[user_id]          # 返回 v2 结构

# 也可以用依赖注入读版本（替代中间件方案）
# Depends 方式比中间件更细粒度，可以按路由选择是否启用
from fastapi import Depends

def get_api_version(x_api_version: str = Header("1", alias="X-API-Version")):
    # Header("1", ...) 第一个参数 "1" 是默认值（没传时用 v1）
    # alias="X-API-Version" 指定实际请求头名
    if x_api_version not in SUPPORTED_VERSIONS:
        raise HTTPException(status_code=400, detail=f"不支持的版本: {x_api_version}")
    # 返回版本号，注入到路由函数
    return x_api_version

@app.get("/users-v2/{user_id}")
def get_user_v2(user_id: int, version: str = Depends(get_api_version)):
    # version 由依赖注入提供，路由函数只关心业务逻辑
    if version == "1":
        # v1 用 name 字段
        return users_v1.get(user_id, {"error": "不存在"})
    # v2 用 username 字段
    return users_v2.get(user_id, {"error": "不存在"})
\`\`\`

测试：
- \`curl -H "X-API-Version: 1" http://localhost:8000/users/1\` → \`{"id":1,"name":"alice","email":"a@b.com"}\`
- \`curl -H "X-API-Version: 2" http://localhost:8000/users/1\` → \`{"id":1,"username":"alice","email":"a@b.com","full_name":"Alice Liddell","avatar":null}\`

Header 版本控制的优点是 URL 不变，对客户端透明；缺点是要测试时得手动加头，不如 URL 版本直观。

## 八、状态码与 Header 完整示例：RESTful 资源 API

把状态码、Header、错误处理结合起来，做一个规范的资源 API。

\`\`\`python
# 从 fastapi 导入 FastAPI、HTTPException、status、Response、Header
from fastapi import FastAPI, HTTPException, status, Response, Header
# 从 pydantic 导入 BaseModel、Field
from pydantic import BaseModel, Field
# 导入 uuid
import uuid

# 创建应用
app = FastAPI(title="文章 API")

# 文章模型
class Article(BaseModel):
    id: str                                  # 文章 ID（UUID 字符串）
    # Field(..., min_length=1) 表示必填且至少 1 字符（不能空标题）
    title: str = Field(..., min_length=1)    # 标题
    content: str                             # 正文
    author: str                              # 作者
    views: int = 0                           # 浏览量，默认 0

# 模拟数据库
db: dict[str, Article] = {}

# 创建文章：201 Created + Location 头
# status_code=201 表示资源创建成功（RESTful 规范，POST 创建用 201）
@app.post("/articles", response_model=Article, status_code=status.HTTP_201_CREATED)
def create_article(article: Article, response: Response):
    article.id = str(uuid.uuid4())           # 生成唯一 ID（UUID4 是随机的）
    article.views = 0                        # 新文章浏览量为 0
    db[article.id] = article                 # 存入数据库
    # Location 头指向新创建的资源（RESTful 规范）
    # 客户端可以从 Location 头拿到新资源的 URL
    response.headers["Location"] = f"/articles/{article.id}"
    # 请求追踪头（每个请求分配唯一 ID，便于日志排查）
    response.headers["X-Request-Id"] = str(uuid.uuid4())
    return article

# 查询文章：200 + X-Total-Count（列表）
# response_model=list[Article] 表示返回 Article 数组
@app.get("/articles", response_model=list[Article])
def list_articles(response: Response):
    articles = list(db.values())             # 把数据库的 values 转成列表
    # 在响应头里返回总数（分页场景常用）
    # 前端分页时需要知道总数来计算页数
    response.headers["X-Total-Count"] = str(len(articles))
    return articles

# 单个查询：404 if not found
# if_none_match 参数从请求头读 If-None-Match（客户端缓存验证）
@app.get("/articles/{article_id}", response_model=Article)
def get_article(article_id: str, response: Response, if_none_match: str | None = Header(None, alias="If-None-Match")):
    if article_id not in db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="文章不存在",
        )
    article = db[article_id]
    # 简单 ETag：用 id+views 作为版本标识
    # ETag 是资源的"指纹"，资源变化 ETag 就变化
    # 客户端下次请求带上 If-None-Match，服务端比对 ETag
    etag = f'"{article_id}-{article.views}"'
    response.headers["ETag"] = etag
    # 如果客户端传了 If-None-Match 且匹配，返回 304 不传 body
    # 304 表示"资源没变"，客户端用本地缓存即可，节省带宽
    if if_none_match == etag:
        response.status_code = status.HTTP_304_NOT_MODIFIED
        return None
    # 增加浏览量
    article.views += 1
    return article

# 更新文章：200 or 404
# PUT 是整体替换语义（客户端要传完整对象）
@app.put("/articles/{article_id}", response_model=Article)
def update_article(article_id: str, article: Article):
    if article_id not in db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="文章不存在")
    article.id = article_id                   # 保持 ID 不变（用 URL 里的 ID）
    # 保留原浏览量（客户端传的 views 不应覆盖服务端统计的值）
    article.views = db[article_id].views
    db[article_id] = article                  # 整体替换存储
    return article

# 删除文章：204 No Content or 404
# 204 表示成功但无内容返回（DELETE 常用）
@app.delete("/articles/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(article_id: str):
    if article_id not in db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="文章不存在")
    del db[article_id]                        # 从数据库删除
    return None                               # 204 不应返回 body
\`\`\`

这个示例体现了：
- **201 + Location**：创建资源后返回新资源 URL。
- **204**：删除成功不返回 body。
- **404**：资源不存在。
- **ETag + If-None-Match + 304**：条件请求，节省带宽。
- **X-Total-Count**：列表响应附带总数。
- **X-Request-Id**：请求追踪。

## 九、状态码选择速查表

| 操作 | 成功 | 资源不存在 | 参数错误 | 冲突 | 未授权 |
|---|---|---|---|---|---|
| GET | 200 | 404 | 400 | - | 401 |
| POST（新建） | 201 | - | 400/422 | 409 | 401 |
| PUT（更新） | 200 | 404 | 400/422 | 409 | 401 |
| PATCH（部分更新） | 200 | 404 | 400/422 | 409 | 401 |
| DELETE | 204 | 404 | - | - | 401 |

记住：**状态码是 API 契约的一部分**，规范的码值让前端能用统一逻辑处理响应，是专业 API 的标志。
`
  },

  // ============================================================
  // 第 19 章：Cookie 与 Session
  // ============================================================
  {
    id: "fa-cookie-session",
    group: "响应处理",
    icon: "🍪",
    title: "Cookie 与 Session",
    content: `# Cookie 与 Session

## 一、Cookie 基础

Cookie 是浏览器存储在客户端的小段数据（一般不超过 4KB），每次请求同一个域名时会自动带上。Cookie 最早由 Netscape 发明，最初为了解决 HTTP 无状态的问题——服务器需要记住"这个请求是谁发的"。

### 1.1 Cookie 的工作机制

1. **服务器下发**：响应头里通过 \`Set-Cookie: name=value; 属性...\` 设置 Cookie。
2. **浏览器存储**：浏览器收到后按域名保存。
3. **自动携带**：之后每次请求该域名，浏览器自动在 \`Cookie\` 请求头里带上。
4. **过期清理**：到了过期时间或浏览器关闭后清除（取决于属性）。

### 1.2 Cookie 的关键属性

| 属性 | 作用 | 示例 |
|---|---|---|
| \`Name=Value\` | 键值对，必填 | \`token=abc123\` |
| \`Domain\` | 生效域名 | \`Domain=.example.com\`（含子域） |
| \`Path\` | 生效路径 | \`Path=/\`（全站） |
| \`Expires\` | 绝对过期时间 | \`Expires=Wed, 11 Jul 2026 12:00:00 GMT\` |
| \`Max-Age\` | 相对存活秒数 | \`Max-Age=3600\`（1 小时） |
| \`HttpOnly\` | 禁止 JS 访问（防 XSS） | \`HttpOnly\` |
| \`Secure\` | 仅 HTTPS 传输 | \`Secure\` |
| \`SameSite\` | 跨站策略 | \`SameSite=Strict/Lax/None\` |

**安全属性详解**：
- \`HttpOnly\`：设置后 \`document.cookie\` 读不到，能防 XSS 偷 token。**登录 Cookie 必须加**。
- \`Secure\`：只在 HTTPS 下发送，防止中间人窃听。**生产环境必加**。
- \`SameSite\`：
  - \`Strict\`：跨站请求完全不带 Cookie，最安全但影响体验（如从 Google 跳过来不带登录态）。
  - \`Lax\`（浏览器默认）：顶层 GET 导航带 Cookie，其他跨站不带。平衡安全和体验。
  - \`None\`：跨站都带，但必须配合 \`Secure\`，否则被拒。第三方 Cookie 场景用。

## 二、Cookie() 获取请求 Cookie

FastAPI 用 \`Cookie()\` 依赖从请求 Cookie 读取值，用法和 \`Query()\`、\`Header()\` 类似。

\`\`\`python
# 从 fastapi 导入 FastAPI、Cookie
from fastapi import FastAPI, Cookie

# 创建应用
app = FastAPI()

# 读取单个 Cookie
@app.get("/profile")
def profile(
    # Cookie() 声明从 Cookie 读 session_id
    # 没有这个 Cookie 时返回 None
    session_id: str | None = Cookie(None),
):
    if session_id is None:
        return {"message": "未登录", "logged_in": False}
    return {"session_id": session_id, "logged_in": True}

# 必填 Cookie
@app.get("/dashboard")
def dashboard(
    # 必填，没带 Cookie 报 422（或 401，取决于校验位置）
    session_id: str = Cookie(...),
):
    # 实际项目要校验 session_id 是否有效
    return {"session_id": session_id, "data": "敏感数据"}

# 读取多个 Cookie
@app.get("/analytics")
def analytics(
    user_id: str | None = Cookie(None),        # user_id Cookie
    referrer: str | None = Cookie(None),       # referrer Cookie
    theme: str | None = Cookie(None),          # theme Cookie
):
    return {
        "user_id": user_id,
        "referrer": referrer,
        "theme": theme,
    }
\`\`\`

**注意**：\`Cookie()\` 的参数名就是 Cookie 名。Cookie 名通常用下划线或连字符，FastAPI 默认不会转换，所以参数名要和 Cookie 名完全一致。

## 三、Response 设置 Cookie

设置 Cookie 需要操作 \`Response\` 对象的 \`set_cookie()\` 方法，或直接写 \`Set-Cookie\` 头。

### 3.1 用 set_cookie 方法（推荐）

\`\`\`python
# 从 fastapi 导入 FastAPI、Response
from fastapi import FastAPI, Response

# 创建应用
app = FastAPI()

# 登录接口：设置登录 Cookie
@app.post("/login")
def login(response: Response):
    # 模拟登录成功，生成 session_id
    session_id = "session_abc123"
    # set_cookie 参数详解：
    response.set_cookie(
        key="session_id",           # Cookie 名
        value=session_id,           # Cookie 值
        max_age=3600,               # 存活 3600 秒（1 小时）
        httponly=True,              # 禁止 JS 访问（防 XSS）
        secure=False,               # 生产环境改 True（仅 HTTPS）
        samesite="lax",             # 跨站策略：Lax（默认推荐）
        path="/",                   # 全站生效
        # domain=None,              # 不设则默认当前域名
    )
    return {"message": "登录成功", "session_id": session_id}

# 登出接口：删除 Cookie
@app.post("/logout")
def logout(response: Response):
    # delete_cookie 通过设置 Max-Age=0 或过期时间来删除
    response.delete_cookie(
        key="session_id",           # 要删的 Cookie 名
        path="/",                   # 路径要和设置时一致才能删掉
    )
    return {"message": "已登出"}

# 直接操作 Set-Cookie 头（不推荐，要自己拼字符串）
@app.get("/custom-cookie")
def custom_cookie(response: Response):
    # 手动拼 Set-Cookie 头，要自己处理属性格式
    response.headers["Set-Cookie"] = "token=xyz; Path=/; HttpOnly; Max-Age=3600"
    return {"message": "ok"}
\`\`\`

\`set_cookie\` 方法参数完整列表：
- \`key\`：Cookie 名（必填）
- \`value\`：Cookie 值
- \`max_age\`：存活秒数（和 expires 二选一）
- \`expires\`：绝对过期时间（datetime 或字符串）
- \`path\`：路径，默认 \`/\`
- \`domain\`：域名
- \`secure\`：是否仅 HTTPS
- \`httponly\`：是否禁止 JS 访问
- \`samesite\`：\`strict\` / \`lax\` / \`none\`

### 3.2 Cookie 属性实战对比

\`\`\`python
# 从 fastapi 导入 FastAPI、Response
from fastapi import FastAPI, Response

app = FastAPI()

# 不安全 Cookie（演示用，别学）
@app.get("/cookie-insecure")
def cookie_insecure(response: Response):
    response.set_cookie(
        key="token",
        value="abc",
        # 没有 httponly/secure，JS 能读，HTTP 能传
    )
    return {"msg": "不安全 Cookie 已设置"}

# 安全 Cookie（生产推荐）
@app.get("/cookie-secure")
def cookie_secure(response: Response):
    response.set_cookie(
        key="token",
        value="abc",
        max_age=86400,            # 1 天
        httponly=True,            # JS 读不到
        secure=True,              # 仅 HTTPS
        samesite="strict",        # 严格防 CSRF
        path="/",
    )
    return {"msg": "安全 Cookie 已设置"}

# 第三方 Cookie（跨站携带，需 None + Secure）
@app.get("/cookie-third-party")
def cookie_third_party(response: Response):
    response.set_cookie(
        key="tracking_id",
        value="xyz",
        samesite="none",          # 跨站都带
        secure=True,              # None 必须配 Secure
        httponly=False,           # 允许 JS 读（埋点需要）
    )
    return {"msg": "第三方 Cookie 已设置"}
\`\`\`

## 四、Session 概念和原理

### 4.1 Session 是什么

Session（会话）是服务器端保存的"用户状态"。Cookie 是存在客户端的，Session 是存在服务器的，两者配合实现登录态：

1. 用户登录成功，服务器创建一个 Session，分配唯一 \`session_id\`。
2. 服务器把 \`session_id\` 通过 Cookie 下发给浏览器。
3. 后续请求浏览器自动带上 \`session_id\` Cookie。
4. 服务器收到 \`session_id\`，从 Session 存储里查到用户信息。

### 4.2 Session 存储方案对比

| 方案 | 存储 | 优点 | 缺点 |
|---|---|---|---|
| 内存 | 进程字典 | 速度快 | 重启丢失、不分布 |
| 文件 | 磁盘 | 持久化 | 慢、并发差 |
| Redis | 内存数据库 | 快、可分布、TTL | 要额外部署 |
| 数据库 | MySQL 等 | 持久、可查询 | 慢 |
| 签名 Cookie | 客户端 | 无服务端存储 | 大小受限、不能撤销 |

### 4.3 为什么不用纯内存 Session

纯内存 Session（如 \`app.state.sessions = {}\`）的问题：
- **重启丢失**：服务重启用户全掉线。
- **不能水平扩展**：A 机器的 Session B 机器读不到。
- **内存泄漏**：过期 Session 不清理会堆积。

生产方案一般是 Redis Session（\`redis-backed session\`）或 JWT（无状态）。本章重点讲**签名 Cookie Session**——它不需要服务端存储，适合中小项目。

## 五、使用 itsdangerous 签名 Cookie

\`itsdangerous\` 是 Flask 作者开发的签名库，能把数据签名后塞进 Cookie。签名后客户端篡改会被服务器发现，但能读出来。FastAPI 没有内置 Session，但可以用 \`itsdangerous\` 自己实现。

### 5.1 安装

\`\`\`bash
pip install itsdangerous
\`\`\`

### 5.2 签名 Cookie Session 实现

\`\`\`python
# 从 fastapi 导入 FastAPI、Response、Cookie、HTTPException、status
from fastapi import FastAPI, Response, Cookie, HTTPException, status
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 itsdangerous 导入 URLSafeTimedSerializer（带过期时间的签名器）
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
# 导入 json
import json

# 创建应用
app = FastAPI()

# 签名密钥（实际项目从环境变量读，不能硬编码）
# 密钥泄漏=所有 Session 可伪造，必须严格保密
SECRET_KEY = "your-super-secret-key-change-in-production"
# 创建签名器
# URLSafeTimedSerializer 会生成 URL 安全的签名串（可放 Cookie）
# salt="session" 是盐值，不同 salt 签名互不通用（隔离不同用途的签名）
serializer = URLSafeTimedSerializer(SECRET_KEY, salt="session")

# Session 数据结构
class SessionData(BaseModel):
    user_id: int                # 用户 ID
    username: str               # 用户名
    role: str = "user"          # 角色，默认普通用户

# ============ 工具函数 ============

# 把 Session 数据签名后写进 Cookie
def set_session(response: Response, data: SessionData):
    # 序列化为 dict 再签名（Pydantic v2 的 model_dump 替代 v1 的 dict()）
    payload = data.model_dump()
    # dumps 返回签名后的字符串（包含数据+签名，客户端可读但无法篡改）
    signed = serializer.dumps(payload)
    # 写进 Cookie
    response.set_cookie(
        key="session",          # Cookie 名
        value=signed,           # 签名后的 Session 数据
        max_age=86400,          # Cookie 1 天过期（86400 秒 = 24 小时）
        httponly=True,          # 防 XSS：JS 读不到 Cookie
        secure=False,           # 生产改 True：仅 HTTPS 传输
        samesite="lax",         # 跨站策略：Lax（平衡安全和体验）
        path="/",               # 全站生效
    )

# 从 Cookie 读 Session 并验证签名
def get_session(session_cookie: str | None) -> SessionData | None:
    # 没有 Cookie 直接返回 None
    if session_cookie is None:
        return None
    try:
        # loads 验证签名+过期时间（max_age 单位秒）
        # 签名错误或过期都会抛异常
        data = serializer.loads(session_cookie, max_age=86400)
        # **data 是字典解包，等价于 SessionData(user_id=..., username=..., role=...)
        return SessionData(**data)
    except SignatureExpired:
        # 签名过期：Session 超时，需要重新登录
        return None
    except BadSignature:
        # 签名无效（被篡改）：可能有人在伪造 Session
        return None

# 清除 Session
def clear_session(response: Response):
    # delete_cookie 通过设置 Max-Age=0 让浏览器立即删除 Cookie
    # path 要和设置时一致，否则删不掉
    response.delete_cookie(key="session", path="/")

# ============ 接口 ============

# 登录：创建 Session
class LoginRequest(BaseModel):
    username: str               # 用户名
    password: str               # 密码

@app.post("/login")
def login(req: LoginRequest, response: Response):
    # 模拟校验（实际查数据库 + 密码哈希比对）
    # 实际项目用 passlib 验证：verify_password(req.password, user.hashed_password)
    if req.username != "alice" or req.password != "123456":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户名或密码错误")
    # 创建 Session 数据
    session = SessionData(user_id=1, username=req.username, role="user")
    # 签名并写进 Cookie
    set_session(response, session)
    return {"message": "登录成功", "user": session.model_dump()}

# 需要登录的接口：读 Session
@app.get("/me")
def me(session: str | None = Cookie(None)):
    # 从 Cookie 读 Session（Cookie 名是 "session"）
    data = get_session(session)
    # Session 无效（未登录/过期/被篡改）则 401
    if data is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="未登录或会话过期")
    return {"user": data.model_dump()}

# 登出：清除 Session
@app.post("/logout")
def logout(response: Response):
    # 清除 Cookie 即可（签名 Cookie 无法服务端撤销，删 Cookie 是唯一方式）
    clear_session(response)
    return {"message": "已登出"}
\`\`\`

**签名 Cookie 的安全性**：
- 签名用 \`SECRET_KEY\`，客户端无法伪造（除非密钥泄漏）。
- 客户端能"看到"内容（Base64 编码，不是加密），所以**不要塞敏感数据**（密码、密钥）。
- 想加密用 \`itsdangerous.URLSafeSerializer\` + 自定义加密，或直接用 JWT。

### 5.3 签名 Cookie 的局限

- **不能主动撤销**：签名有效期内，即使用户"登出"，签名本身仍能被解码。要撤销得改密钥（影响所有人）或维护黑名单。
- **大小受限**：Cookie 单条 4KB，Session 数据不能太大。
- **密钥管理**：密钥泄漏=所有 Session 可伪造，密钥要严格保密、定期轮换。

## 六、实战：基于 Cookie 的完整登录状态管理

把前面的知识点整合，做一个有登录、登出、权限检查、自动续期的完整方案。

\`\`\`python
# 从 fastapi 导入 FastAPI、Response、Cookie、HTTPException、status、Depends
from fastapi import FastAPI, Response, Cookie, HTTPException, status, Depends
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 itsdangerous 导入签名器和异常
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
# 导入时间相关
from datetime import datetime, timezone

# 创建应用
app = FastAPI(title="Cookie Session Demo")

# ============ 配置 ============
SECRET_KEY = "dev-secret-key-change-in-production"
SESSION_MAX_AGE = 3600  # Session 有效期 1 小时（秒）
serializer = URLSafeTimedSerializer(SECRET_KEY, salt="auth-session")

# ============ 模型 ============
class SessionData(BaseModel):
    user_id: int                # 用户 ID
    username: str               # 用户名
    role: str = "user"          # 角色，默认普通用户
    login_at: str               # 登录时间（ISO 格式字符串）

class LoginRequest(BaseModel):
    username: str               # 用户名
    password: str               # 密码（明文传输，生产环境必须用 HTTPS）

# ============ 模拟用户数据库 ============
# 实际项目用数据库存储，密码字段存哈希值而非明文
USERS = {
    "alice": {"id": 1, "username": "alice", "password": "secret123", "role": "user"},
    "admin": {"id": 2, "username": "admin", "password": "admin456", "role": "admin"},
}

# ============ Session 工具函数 ============

def create_session(response: Response, user: dict) -> SessionData:
    """登录成功后创建 Session 并写进 Cookie"""
    # 构造 Session 数据
    session = SessionData(
        user_id=user["id"],
        username=user["username"],
        role=user["role"],
        # datetime.now(timezone.utc) 获取 UTC 时间，isoformat() 转 ISO 字符串
        login_at=datetime.now(timezone.utc).isoformat(),
    )
    # 签名后序列化（包含数据+签名+时间戳）
    signed = serializer.dumps(session.model_dump())
    # 写进 Cookie，浏览器会自动保存并在后续请求带上
    response.set_cookie(
        key="session",            # Cookie 名
        value=signed,             # 签名后的 Session 数据
        max_age=SESSION_MAX_AGE,  # 存活秒数（1 小时）
        httponly=True,            # 防 XSS：JS 读不到
        secure=False,             # 生产改 True：仅 HTTPS 传输
        samesite="lax",           # 跨站策略：Lax
        path="/",                 # 全站生效
    )
    return session

def read_session(session_cookie: str | None) -> SessionData | None:
    """从 Cookie 读取并验证 Session"""
    # 没有 Cookie 直接返回 None（未登录）
    if not session_cookie:
        return None
    try:
        # loads 验证签名+过期时间
        # max_age=SESSION_MAX_AGE 超过这个时间视为过期
        data = serializer.loads(session_cookie, max_age=SESSION_MAX_AGE)
        # **data 字典解包，构造 SessionData 实例
        return SessionData(**data)
    except (BadSignature, SignatureExpired):
        # 签名无效（被篡改）或已过期，返回 None
        return None

def require_session(session: str | None = Cookie(None)) -> SessionData:
    """依赖：要求已登录，否则 401"""
    # Cookie(None) 从名为 session 的 Cookie 取值，没有则 None
    data = read_session(session)
    if data is None:
        # 未登录或 Session 过期，返回 401
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未登录或会话已过期",
        )
    return data

def require_admin(session: SessionData = Depends(require_session)) -> SessionData:
    """依赖：要求管理员"""
    # 依赖 require_session（先验证登录，再验证权限）
    # require_session 的返回值（SessionData）注入到 session 参数
    if session.role != "admin":
        # 非 admin 返回 403 Forbidden
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限",
        )
    return session

# ============ 接口 ============

# 登录：验证用户名密码，创建 Session
@app.post("/login")
def login(req: LoginRequest, response: Response):
    # 从模拟数据库查用户
    user = USERS.get(req.username)
    # 用户不存在或密码不匹配
    if user is None or user["password"] != req.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户名或密码错误")
    # 登录成功，创建 Session 并写进 Cookie
    session = create_session(response, user)
    return {"message": "登录成功", "session": session.model_dump()}

# 登出：删除 Cookie
@app.post("/logout")
def logout(response: Response):
    # delete_cookie 通过设置 Max-Age=0 让浏览器删除 Cookie
    # path 要和设置时一致才能删掉
    response.delete_cookie(key="session", path="/")
    return {"message": "已登出"}

# 查看当前登录信息（需要登录）
# Depends(require_session) 自动校验登录态，失败返回 401
@app.get("/me")
def me(session: SessionData = Depends(require_session)):
    return {"user": session.model_dump()}

# 用户专属接口（需要登录）
@app.get("/dashboard")
def dashboard(session: SessionData = Depends(require_session)):
    return {
        "message": f"欢迎回来，{session.username}",
        "login_at": session.login_at,
    }

# 管理员接口（需要管理员）
# Depends(require_admin) 先验证登录，再验证 admin 角色
@app.get("/admin/users")
def admin_list_users(session: SessionData = Depends(require_admin)):
    # 这里只有 admin 能进来，非 admin 会被 require_admin 拦截
    return {"users": list(USERS.values()), "requested_by": session.username}

# 公开接口（不需要登录）
@app.get("/public")
def public():
    return {"message": "这是公开接口，任何人都能访问"}
\`\`\`

这个方案的特点：
- **依赖注入**：\`require_session\` 和 \`require_admin\` 作为 Depends，路由声明 \`session: SessionData = Depends(require_session)\` 即可。
- **分层权限**：\`require_admin\` 依赖 \`require_session\`，复用登录检查。
- **签名验证**：每次请求都验证签名和过期时间，篡改/过期直接 401。
- **登出清 Cookie**：虽然签名仍可解码，但浏览器删了 Cookie 就不会再发。

## 七、Cookie 安全注意事项

### 7.1 常见攻击与防御

| 攻击 | 原理 | 防御 |
|---|---|---|
| **XSS 偷 Cookie** | JS 读 \`document.cookie\` 发给攻击者 | \`HttpOnly=True\` |
| **中间人窃听** | HTTP 明文传输被抓包 | \`Secure=True\`（仅 HTTPS） |
| **CSRF** | 攻击者诱导用户点链接发跨站请求 | \`SameSite=Lax/Strict\` + CSRF Token |
| **Cookie 篡改** | 客户端改 Cookie 值 | 服务端签名（itsdangerous / JWT） |
| **会话固定** | 攻击者预设 session_id | 登录后重新生成 session_id |
| **会话劫持** | 偷到 session_id 冒充 | HTTPS + IP/UA 绑定 + 短有效期 |

### 7.2 安全配置清单

\`\`\`python
# 安全 Cookie 配置模板
response.set_cookie(
    key="session",
    value=signed_value,
    max_age=3600,              # 短有效期，敏感操作要重新登录
    httponly=True,             # 必加：防 XSS
    secure=True,               # 生产必加：仅 HTTPS
    samesite="lax",            # 或 strict，防 CSRF
    path="/",
    # domain 不设，默认当前域名，避免子域共享风险
)
\`\`\`

### 7.3 Session 续期策略

签名 Cookie Session 默认过期就失效。要实现"活跃用户续期"，可以在中间件里重新签名下发：

\`\`\`python
# 从 fastapi 导入 Request
from fastapi import Request

# 续期中间件：每次请求都续期
@app.middleware("http")
async def renew_session(request: Request, call_next):
    response = await call_next(request)
    # 读取当前 Cookie
    session_cookie = request.cookies.get("session")
    if session_cookie:
        try:
            # 重新签名（新的过期时间）
            data = serializer.loads(session_cookie, max_age=SESSION_MAX_AGE)
            new_signed = serializer.dumps(data)
            response.set_cookie(
                key="session",
                value=new_signed,
                max_age=SESSION_MAX_AGE,
                httponly=True,
                samesite="lax",
                path="/",
            )
        except (BadSignature, SignatureExpired):
            pass  # 过期/无效就不续
    return response
\`\`\`

这样活跃用户的 Session 会一直续期，不活跃的过 1 小时自动失效。

## 八、Cookie vs Session vs Token 对比

| 维度 | Cookie（纯） | Session（服务端） | Token（JWT） |
|---|---|---|---|
| 存储位置 | 客户端 | 服务端 | 客户端 |
| 状态 | 无状态 | 有状态 | 无状态 |
| 撤销 | 改 Cookie | 删 Session 记录 | 难（要黑名单） |
| 扩展性 | 好 | 差（共享存储） | 好 |
| 大小 | 4KB 限制 | 无限 | 4KB 限制 |
| 安全 | 签名才安全 | 较好 | 签名+可选加密 |

选择建议：
- **小项目 / 单机**：签名 Cookie Session（本章方案）。
- **中大型 / 分布式**：Redis Session。
- **微服务 / 跨域 / 移动端**：JWT。
- **最高安全**：服务端 Session + CSRF Token + HTTPS。

## 九、本章小结

Cookie 和 Session 是 Web 登录的基础设施。掌握本章后你能：
- 用 \`Cookie()\` 读请求 Cookie，用 \`response.set_cookie()\` 写响应 Cookie。
- 配置 \`HttpOnly\`、\`Secure\`、\`SameSite\` 三大安全属性。
- 用 \`itsdangerous\` 实现无服务端存储的签名 Cookie Session。
- 用依赖注入封装"需要登录"和"需要管理员"权限检查。
- 识别和防御 XSS、CSRF、会话固定等常见攻击。

下一章我们学习流式响应和文件下载，处理大文件、实时数据等场景。
`
  },

  // ============================================================
  // 第 20 章：流式响应与文件下载
  // ============================================================
  {
    id: "fa-streaming",
    group: "响应处理",
    icon: "🌊",
    title: "流式响应与文件下载",
    content: `# 流式响应与文件下载

## 一、为什么需要流式响应

前面章节的接口都是"一次性返回完整 JSON"。但当数据量大、或数据是持续生成的时候，一次性返回会有问题：

1. **内存爆炸**：导出 100 万行 CSV，全部读进内存再返回，服务器可能 OOM。
2. **首字节延迟高**：客户端要等服务器把全部数据准备好才能收到第一个字节，体验差。
3. **无法实时推送**：如日志流、SSE（Server-Sent Events）、AI 生成内容（ChatGPT 式打字效果），需要边生成边发。
4. **大文件下载**：1GB 文件全部读进内存再发，并发几个就崩了。

流式响应（Streaming Response）解决这些问题：**数据分块发送，生成一块发一块，不用等全部就绪**。FastAPI 提供了 \`StreamingResponse\` 和 \`FileResponse\` 两个核心工具。

## 二、StreamingResponse 流式响应

\`StreamingResponse\` 接受一个**生成器函数**（或任何可迭代对象），逐块产出数据并发送给客户端。

### 2.1 基础：生成器 yield 数据

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入 StreamingResponse
from fastapi.responses import StreamingResponse
# 导入 time 用于模拟耗时
import time

# 创建应用
app = FastAPI()

# 生成器函数：逐行 yield 数据
# 生成器用 yield 而不是 return，每次 yield 暂停，下次调用从暂停处继续
def generate_numbers():
    """生成 1 到 5 的数字，每个间隔 1 秒"""
    for i in range(1, 6):
        # 模拟耗时计算（实际可能是查数据库、调 API）
        time.sleep(1)
        # yield 一块数据（必须是 bytes 或 str）
        # encode("utf-8") 把字符串转成 bytes
        yield f"数字 {i}\\n".encode("utf-8")

# 流式接口：客户端会逐块收到数据，不用等全部生成
@app.get("/stream/numbers")
def stream_numbers():
    return StreamingResponse(
        content=generate_numbers(),       # 传入生成器（不是调用结果，是生成器对象）
        media_type="text/plain",          # 响应类型：纯文本（决定浏览器如何处理）
    )
\`\`\`

访问 \`GET /stream/numbers\`，客户端会每秒收到一行 \`数字 1\\n\`、\`数字 2\\n\`...，而不是等 5 秒后一次性收到全部。这就是流式的核心优势——**首字节延迟低**。

**关键点**：
- 生成器 \`yield\` 的每一块都会立即发送。
- \`media_type\` 要正确设置，决定浏览器怎么处理（文本、CSV、二进制等）。
- 生成器结束（\`return\` 或抛异常）时响应结束。

### 2.2 流式 JSON：边生成边发

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入 StreamingResponse
from fastapi.responses import StreamingResponse
# 导入 json
import json
# 导入 time
import time

# 创建应用
app = FastAPI()

# 流式返回 JSON 数组：[{"id":1}, {"id":2}, ...]
def generate_json_array():
    """生成 JSON 数组的流式版本"""
    # 先 yield 数组开始括号
    yield b"["
    for i in range(1, 6):
        if i > 1:
            # 元素之间用逗号分隔
            yield b","
        # yield 单个对象
        item = {"id": i, "name": f"item-{i}", "ts": time.time()}
        yield json.dumps(item).encode("utf-8")
        # 模拟耗时
        time.sleep(0.5)
    # 最后 yield 数组结束括号
    yield b"]"

@app.get("/stream/json")
def stream_json():
    return StreamingResponse(
        content=generate_json_array(),
        media_type="application/json",
    )
\`\`\`

客户端最终收到的还是合法 JSON 数组，但服务端是分块发送的。这种技巧在"返回大量数据但客户端要 JSON 格式"时有用。

## 三、大文件分块下载

大文件下载是流式响应的经典场景。**不要 \`open().read()\` 全读进内存**，要分块读取、分块发送。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入 StreamingResponse
from fastapi.responses import StreamingResponse
# 导入 os 用于文件操作
import os

# 创建应用
app = FastAPI()

# 分块读取文件的生成器
def file_iterator(file_path: str, chunk_size: int = 8192):
    """
    分块读取文件
    :param file_path: 文件路径
    :param chunk_size: 每块字节数，默认 8KB
    """
    # 用 with 确保文件关闭（即使异常也会自动关闭）
    # "rb" 表示二进制读取模式（文件下载必须用二进制）
    with open(file_path, "rb") as f:
        # 循环读取，直到文件结束
        while True:
            # 读取一块（最多 chunk_size 字节）
            chunk = f.read(chunk_size)
            # 读到空说明文件结束
            if not chunk:
                break
            # yield 这一块（发送给客户端）
            yield chunk

# 大文件下载接口
@app.get("/download/{filename}")
def download_file(filename: str):
    # 拼接文件路径（实际项目要做路径校验，防目录穿越）
    # 目录穿越攻击：filename="../../etc/passwd" 能读到系统文件
    file_path = os.path.join("files", filename)
    # 检查文件是否存在
    if not os.path.exists(file_path):
        return {"error": "文件不存在"}
    # 获取文件大小（可选，设置 Content-Length）
    # Content-Length 让浏览器显示下载进度条
    file_size = os.path.getsize(file_path)
    # 返回流式响应
    return StreamingResponse(
        content=file_iterator(file_path, chunk_size=64 * 1024),  # 64KB 一块
        media_type="application/octet-stream",                   # 二进制流（通用类型）
        headers={
            # Content-Disposition: attachment 触发浏览器下载而非显示
            # filename 指定下载后的文件名
            "Content-Disposition": f'attachment; filename="{filename}"',  # 触发下载
            "Content-Length": str(file_size),                    # 文件大小
        },
    )
\`\`\`

**关键点**：
- \`chunk_size\` 一般 8KB-64KB，太小开销大，太大占内存。
- \`Content-Disposition: attachment\` 让浏览器下载而非在线预览。
- \`Content-Length\` 让浏览器显示下载进度条。
- **路径校验**：\`filename\` 来自用户输入，要防 \`../../etc/passwd\` 这种目录穿越攻击。

### 3.1 路径安全校验

\`\`\`python
# 从 fastapi 导入 FastAPI、HTTPException
from fastapi import FastAPI, HTTPException
# 从 pathlib 导入 Path
from pathlib import Path
# 导入 os
import os

app = FastAPI()

# 允许的文件根目录
ALLOWED_DIR = Path("files").resolve()

def safe_join(base: Path, filename: str) -> Path | None:
    """
    安全拼接路径，防止目录穿越
    """
    # 解析目标完整路径
    target = (base / filename).resolve()
    # 检查目标是否在允许的目录内
    try:
        target.relative_to(base)
    except ValueError:
        # 不在允许目录内，拒绝
        return None
    return target

@app.get("/safe-download/{filename}")
def safe_download(filename: str):
    file_path = safe_join(ALLOWED_DIR, filename)
    if file_path is None or not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")
    # ... 流式返回
    return {"file": str(file_path)}
\`\`\`

\`Path.resolve()\` 会解析 \`..\` 等，再和 \`base\` 比对，确保目标在允许范围内。

## 四、FileResponse 文件响应

\`FileResponse\` 是 FastAPI 专门为"返回文件"设计的响应类，比 \`StreamingResponse\` 手写文件迭代更方便，内部用 ASGI 的文件发送优化，性能更好。

\`\`\`python
# 从 fastapi 导入 FastAPI、HTTPException
from fastapi import FastAPI, HTTPException
# 从 fastapi.responses 导入 FileResponse
from fastapi.responses import FileResponse
# 从 pathlib 导入 Path
from pathlib import Path

# 创建应用
app = FastAPI()

# 文件目录
FILES_DIR = Path("files")

# FileResponse 自动处理：流式读取、Content-Length、ETag、Last-Modified
@app.get("/file/{filename}")
def get_file(filename: str):
    file_path = FILES_DIR / filename
    # 检查文件存在
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="文件不存在")
    # FileResponse 参数：
    return FileResponse(
        path=str(file_path),                # 文件路径（必填）
        media_type="application/octet-stream",  # 媒体类型
        filename=filename,                  # 下载时的文件名（触发 Content-Disposition）
        # headers=None,                    # 额外头
        # stat_result=None,                # 文件 stat 信息（缓存用）
    )
\`\`\`

\`FileResponse\` 的优势：
- 自动设置 \`Content-Length\`、\`Last-Modified\`、\`ETag\`。
- 用 ASGI 的 \`send_file\` 优化（零拷贝，性能最好）。
- 设 \`filename\` 自动生成 \`Content-Disposition: attachment\` 头。

### 4.1 media_type 与 filename 的作用

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入 FileResponse
from fastapi.responses import FileResponse
# 从 pathlib 导入 Path
from pathlib import Path

app = FastAPI()
FILES_DIR = Path("files")

# 图片预览：media_type 设图片类型，浏览器在线显示而非下载
@app.get("/preview/image/{filename}")
def preview_image(filename: str):
    file_path = FILES_DIR / filename
    # media_type 设为 image/jpeg，浏览器内联显示
    # 不设 filename，就不会触发 attachment，变成 inline
    return FileResponse(
        path=str(file_path),
        media_type="image/jpeg",        # 浏览器识别为图片，内联显示
    )

# 强制下载：设 filename，触发 attachment
@app.get("/download/image/{filename}")
def download_image(filename: str):
    file_path = FILES_DIR / filename
    return FileResponse(
        path=str(file_path),
        media_type="image/jpeg",        # 类型仍是图片
        filename=filename,              # 设了 filename → attachment → 下载
    )

# 不同类型文件的 media_type
@app.get("/file-typed/{filename}")
def file_typed(filename: str):
    file_path = FILES_DIR / filename
    # 根据扩展名判断 media_type
    ext = file_path.suffix.lower()
    media_types = {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".png": "image/png",
        ".mp4": "video/mp4",
        ".mp3": "audio/mpeg",
        ".csv": "text/csv",
        ".zip": "application/zip",
    }
    media_type = media_types.get(ext, "application/octet-stream")
    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        filename=filename,
    )
\`\`\`

## 五、Content-Disposition 头详解

\`Content-Disposition\` 控制浏览器如何处理响应体：

- \`inline\`：内联显示（默认），浏览器能渲染就渲染（图片、PDF、文本）。
- \`attachment; filename="xxx"\`：强制下载，\`filename\` 是建议的保存名。

\`\`\`python
# 从 fastapi 导入 FastAPI、Response
from fastapi import FastAPI, Response
# 从 fastapi.responses 导入 StreamingResponse
from fastapi.responses import StreamingResponse

app = FastAPI()

# inline：浏览器内联显示
@app.get("/inline")
def inline():
    content = b"<h1>Hello</h1><p>这是一段 HTML</p>"
    return StreamingResponse(
        content=iter([content]),
        media_type="text/html",
        headers={"Content-Disposition": "inline"},
    )

# attachment：强制下载
@app.get("/attachment")
def attachment():
    content = b"hello world"
    return StreamingResponse(
        content=iter([content]),
        media_type="text/plain",
        headers={"Content-Disposition": 'attachment; filename="hello.txt"'},
    )

# 中文文件名：用 RFC 5987 编码
from urllib.parse import quote

@app.get("/chinese-name")
def chinese_name():
    content = b"你好"
    filename = "你好.txt"
    # 中文文件名要用 RFC 5987 编码，避免乱码
    encoded = quote(filename)
    disposition = f"attachment; filename*=UTF-8''{encoded}"
    return StreamingResponse(
        content=iter([content]),
        media_type="text/plain",
        headers={"Content-Disposition": disposition},
    )
\`\`\`

中文文件名的坑：直接写 \`filename="你好.txt"\` 在某些浏览器会乱码。规范做法是 \`filename*=UTF-8''<url编码>\` 格式。

## 六、Response 直接返回原始内容

除了专门的响应类，还可以用基础 \`Response\` 完全控制返回内容。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入 Response
from fastapi.responses import Response

app = FastAPI()

# 返回原始字节
@app.get("/raw")
def raw():
    # Response 直接返回 bytes，完全自定义
    return Response(
        content=b"raw bytes content",
        media_type="text/plain",
    )

# 返回 XML
@app.get("/xml")
def xml():
    xml_content = '<?xml version="1.0"?><root><item>hello</item></root>'
    return Response(
        content=xml_content.encode("utf-8"),
        media_type="application/xml",
    )

# 返回自定义状态码和头
@app.get("/custom")
def custom():
    return Response(
        content=b"created",
        status_code=201,
        media_type="text/plain",
        headers={"X-Custom": "value"},
    )
\`\`\`

\`Response\` 是所有响应类的基类，\`JSONResponse\`、\`HTMLResponse\`、\`PlainTextResponse\` 都继承自它。需要完全控制时直接用 \`Response\`。

## 七、PlainTextResponse、HTMLResponse、RedirectResponse

FastAPI 提供了几个常用响应类快捷方式。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入各种响应类
from fastapi.responses import (
    PlainTextResponse,    # 纯文本
    HTMLResponse,         # HTML
    RedirectResponse,     # 重定向
    JSONResponse,         # JSON
    Response,             # 基础
)

app = FastAPI()

# PlainTextResponse：纯文本
@app.get("/text", response_class=PlainTextResponse)
def text():
    # Content-Type: text/plain; charset=utf-8
    return "这是一段纯文本，不会被当 HTML 解析"

# HTMLResponse：HTML
@app.get("/html", response_class=HTMLResponse)
def html():
    # Content-Type: text/html; charset=utf-8
    return """
    <!DOCTYPE html>
    <html>
    <head><title>测试</title></head>
    <body><h1>你好，HTML</h1></body>
    </html>
    """

# RedirectResponse：重定向
@app.get("/old-page")
def old_page():
    # 307 临时重定向到 /new-page
    return RedirectResponse(url="/new-page", status_code=307)

@app.get("/new-page")
def new_page():
    return {"message": "这是新页面"}

# 永久重定向（301）
@app.get("/legacy")
def legacy():
    return RedirectResponse(url="/new-page", status_code=301)

# JSONResponse：手动返回 JSON（带自定义状态码）
@app.get("/error")
def error():
    return JSONResponse(
        status_code=418,
        content={"error": "I'm a teapot", "code": 418},
    )
\`\`\`

**重定向状态码**：
- 301：永久重定向（SEO 友好，旧 URL 权重转移）。
- 302：临时重定向。
- 307：临时重定向，保持原请求方法（POST 还是 POST）。
- 308：永久重定向，保持原请求方法。

## 八、Server-Sent Events（SSE）实时推送

SSE 是流式响应的重要应用：服务器持续推送事件给浏览器，浏览器用 \`EventSource\` API 接收。ChatGPT 的打字效果就是 SSE。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入 StreamingResponse
from fastapi.responses import StreamingResponse
# 导入 time 和 json
import time
import json

app = FastAPI()

# SSE 生成器
def sse_generator():
    """
    SSE 格式：每个事件用 data: 开头，空行结束
    """
    for i in range(1, 11):
        # 构造事件数据
        event_data = {"count": i, "message": f"第 {i} 条消息"}
        # SSE 格式：data: <内容>\\n\\n
        yield f"data: {json.dumps(event_data)}\\n\\n"
        # 间隔 1 秒
        time.sleep(1)
    # 发送结束事件
    yield "data: [DONE]\\n\\n"

# SSE 接口
@app.get("/sse")
def sse():
    return StreamingResponse(
        content=sse_generator(),
        media_type="text/event-stream",    # SSE 专用 media_type
        headers={
            "Cache-Control": "no-cache",   # 不缓存
            "Connection": "keep-alive",    # 保持连接
        },
    )
\`\`\`

前端用 \`EventSource\` 接收：
\`\`\`javascript
const es = new EventSource("/sse");
es.onmessage = (e) => {
    if (e.data === "[DONE]") {
        es.close();
        return;
    }
    const data = JSON.parse(e.data);
    console.log(data);
};
\`\`\`

SSE 比 WebSocket 简单（单向、基于 HTTP），适合"服务器推、客户端只收"的场景：通知、日志、AI 流式回复。

## 九、实战：CSV 导出 API + 图片下载 API

把流式响应和文件下载结合起来，做两个生产级接口。

### 9.1 CSV 导出（流式生成，不占内存）

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入 StreamingResponse
from fastapi.responses import StreamingResponse
# 导入 csv 和 io
import csv
import io
# 导入时间
from datetime import datetime, timezone

app = FastAPI()

# 模拟数据库查询（实际用 SQLAlchemy）
# 用生成器模拟"分批取数据"，避免一次性加载 10 万行到内存
def fetch_users(limit: int = 100000):
    """模拟从数据库分批取用户"""
    for i in range(1, limit + 1):
        # yield 每个用户，模拟从数据库逐行读取
        yield {
            "id": i,
            "username": f"user_{i}",
            "email": f"user_{i}@example.com",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

# CSV 流式生成器
def generate_csv():
    """
    流式生成 CSV，每行 yield 一次
    """
    # 在内存中创建 StringIO 写 CSV（StringIO 是内存中的文本流）
    output = io.StringIO()
    # csv.writer 把列表写成 CSV 行（自动处理逗号、引号转义）
    writer = csv.writer(output)
    # 写表头
    writer.writerow(["ID", "用户名", "邮箱", "注册时间"])
    # yield 表头（带 UTF-8 BOM，让 Excel 正确识别中文）
    # \\xef\\xbb\\xbf 是 UTF-8 BOM 的字节序列
    yield b'\\xef\\xbb\\xbf' + output.getvalue().encode("utf-8")
    # 清空 buffer 准备写数据行
    # seek(0) 移到开头，truncate(0) 截断为 0 字节
    output.seek(0)
    output.truncate(0)
    # 分批写数据
    count = 0
    for user in fetch_users(limit=1000):
        # 写一行 CSV
        writer.writerow([user["id"], user["username"], user["email"], user["created_at"]])
        count += 1
        # 每攒 100 行 yield 一次，平衡性能和内存
        # 太频繁 yield 增加 IO 次数，太少则占内存
        if count % 100 == 0:
            yield output.getvalue().encode("utf-8")
            output.seek(0)
            output.truncate(0)
    # 写剩余的行（不满 100 行的尾部数据）
    if output.getvalue():
        yield output.getvalue().encode("utf-8")

# CSV 导出接口
@app.get("/export/users.csv")
def export_users():
    return StreamingResponse(
        content=generate_csv(),
        media_type="text/csv",
        headers={
            # 强制下载，文件名 users.csv
            "Content-Disposition": 'attachment; filename="users.csv"',
            # 不缓存
            "Cache-Control": "no-cache",
        },
    )
\`\`\`

**要点**：
- 用生成器边查数据库边写 CSV，不把全部数据加载进内存。
- 每攒 100 行 yield 一次，减少 IO 次数。
- UTF-8 BOM（\`\\xef\\xbb\\xbf\`）让 Excel 正确显示中文。
- \`Content-Disposition: attachment\` 触发下载。

### 9.2 图片下载 API（带缩略图和水印）

\`\`\`python
# 从 fastapi 导入 FastAPI、HTTPException、Query
from fastapi import FastAPI, HTTPException, Query
# 从 fastapi.responses 导入 FileResponse、StreamingResponse
from fastapi.responses import FileResponse, StreamingResponse
# 从 pathlib 导入 Path
from pathlib import Path
# 导入 io
import io

app = FastAPI()

# 图片存储目录
# Path("images") 创建 Path 对象指向 images 文件夹
IMAGES_DIR = Path("images")
# mkdir(exist_ok=True) 创建目录，如果已存在不报错
IMAGES_DIR.mkdir(exist_ok=True)

# 模拟创建一张测试图片（实际项目图片是用户上传的）
def ensure_sample_image():
    """确保有一张示例图片"""
    sample = IMAGES_DIR / "sample.jpg"
    if not sample.exists():
        # 用 Pillow 生成一张图（需 pip install Pillow）
        try:
            from PIL import Image, ImageDraw
            # Image.new 创建新图，"RGB" 模式，400x300 尺寸，背景色 lightblue
            img = Image.new("RGB", (400, 300), color="lightblue")
            # ImageDraw.Draw 创建绘图对象，用于在图片上画文字/图形
            draw = ImageDraw.Draw(img)
            # 在 (100,150) 位置写文字
            draw.text((100, 150), "Sample Image", fill="black")
            # 保存为 JPEG 格式
            img.save(sample, "JPEG")
        except ImportError:
            # 没 Pillow 就写个占位字节
            sample.write_bytes(b"fake image data")
    return sample

# 原图下载
# 设了 filename 参数会触发 Content-Disposition: attachment，浏览器下载
@app.get("/download/image/{name}")
def download_image(name: str):
    file_path = IMAGES_DIR / name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="图片不存在")
    return FileResponse(
        path=str(file_path),       # 文件路径
        media_type="image/jpeg",   # 图片类型
        filename=name,             # 触发下载（生成 attachment 头）
    )

# 图片预览（内联显示）
# 不设 filename，浏览器内联显示而不是下载
@app.get("/preview/image/{name}")
def preview_image(name: str):
    file_path = IMAGES_DIR / name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="图片不存在")
    return FileResponse(
        path=str(file_path),
        media_type="image/jpeg",
        # 不设 filename，浏览器内联显示
    )

# 动态缩略图（用 Pillow 实时生成，流式返回）
# Query(128, ge=32, le=512) 默认 128，最小 32，最大 512
@app.get("/thumbnail/{name}")
def thumbnail(name: str, size: int = Query(128, ge=32, le=512)):
    """
    动态生成缩略图
    :param name: 图片名
    :param size: 缩略图边长，32-512
    """
    file_path = IMAGES_DIR / name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="图片不存在")
    try:
        from PIL import Image
    except ImportError:
        raise HTTPException(status_code=500, detail="服务器未安装 Pillow")

    # 打开原图
    img = Image.open(file_path)
    # 生成缩略图（保持比例，不拉伸变形）
    # thumbnail 是原地操作，会修改 img 对象
    img.thumbnail((size, size))
    # 存进内存（BytesIO 是内存中的二进制流）
    buf = io.BytesIO()
    # quality=85 设置 JPEG 质量（85 是质量和体积的平衡点）
    img.save(buf, format="JPEG", quality=85)
    # seek(0) 把读写指针移回开头（否则读不到数据）
    buf.seek(0)
    # 流式返回
    # iter([buf.getvalue()]) 把字节数据包成可迭代对象
    return StreamingResponse(
        content=iter([buf.getvalue()]),
        media_type="image/jpeg",
        headers={
            # 缓存 1 天（86400 秒），减少重复计算
            "Cache-Control": "public, max-age=86400",
        },
    )

# 初始化时创建示例图片
# @app.on_event("startup") 是 FastAPI 的启动事件钩子
# 应用启动时自动调用（新版推荐用 lifespan 替代）
@app.on_event("startup")
def startup():
    ensure_sample_image()
\`\`\`

这个示例展示了：
- **原图下载**：\`FileResponse\` + \`filename\` → attachment 下载。
- **图片预览**：\`FileResponse\` 不设 \`filename\` → inline 显示。
- **动态缩略图**：Pillow 实时生成，\`StreamingResponse\` 返回内存字节。
- **缓存头**：缩略图设 \`Cache-Control\` 减少重复计算。

### 9.3 完整下载服务（带权限和日志）

\`\`\`python
# 从 fastapi 导入 FastAPI、HTTPException、Header、Depends
from fastapi import FastAPI, HTTPException, Header, Depends
# 从 fastapi.responses 导入 FileResponse
from fastapi.responses import FileResponse
# 从 pathlib 导入 Path
from pathlib import Path
# 导入 logging
import logging

app = FastAPI()
FILES_DIR = Path("files")

# 配置日志
# basicConfig 设置日志级别，INFO 及以上会输出
logging.basicConfig(level=logging.INFO)
# 创建 logger 实例，名字 "download" 用于区分不同模块的日志
logger = logging.getLogger("download")

# 简单 token 校验
# 实际项目用 JWT 或数据库查 token
VALID_TOKENS = {"abc123", "xyz789"}

def verify_token(x_download_token: str = Header(..., alias="X-Download-Token")):
    """校验下载 token"""
    # Header(..., alias="X-Download-Token") 从请求头取 X-Download-Token
    # ... 表示必填，没传会 422
    if x_download_token not in VALID_TOKENS:
        # token 不在有效集合里，返回 403
        raise HTTPException(status_code=403, detail="无效的下载 token")
    return x_download_token

# 受保护的下载接口
# Depends(verify_token) 自动校验 token，失败返回 403
@app.get("/secure-download/{filename}")
def secure_download(filename: str, token: str = Depends(verify_token)):
    # 安全路径拼接
    # resolve() 解析绝对路径，处理 .. 等符号
    file_path = (FILES_DIR / filename).resolve()
    try:
        # relative_to 检查目标路径是否在 FILES_DIR 内
        # 如果不在会抛 ValueError（说明想目录穿越）
        file_path.relative_to(FILES_DIR.resolve())
    except ValueError:
        raise HTTPException(status_code=400, detail="非法路径")
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")
    # 记录下载日志（谁下载了什么）
    logger.info(f"用户 token={token} 下载文件 {filename}")
    return FileResponse(
        path=str(file_path),
        filename=filename,                          # 触发下载
        media_type="application/octet-stream",      # 通用二进制类型
    )
\`\`\`

## 十、流式响应注意事项

### 10.1 不能用 response_model 过滤

\`StreamingResponse\` 和 \`FileResponse\` 是"原始响应"，\`response_model\` 不生效。因为流式响应返回的是字节流，不是结构化数据，Pydantic 没法过滤。

\`\`\`python
# 这个 response_model 会被忽略
@app.get("/stream", response_model=SomeModel)
def stream():
    return StreamingResponse(...)   # response_model 不生效
\`\`\`

### 10.2 异步生成器

异步生成器（\`async def\` + \`yield\`）也支持，适合 IO 密集场景（如异步查数据库）。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入 StreamingResponse
from fastapi.responses import StreamingResponse
# 导入 asyncio
import asyncio

app = FastAPI()

# 异步生成器
async def async_generate():
    for i in range(5):
        # 模拟异步 IO（如 await db.fetch_one()）
        await asyncio.sleep(1)
        yield f"async chunk {i}\\n".encode("utf-8")

@app.get("/async-stream")
def async_stream():
    return StreamingResponse(content=async_generate(), media_type="text/plain")
\`\`\`

### 10.3 错误处理

流式响应一旦开始发送（状态码和头已发出），就不能再改状态码了。所以错误要在发送前抛出。

\`\`\`python
# 从 fastapi 导入 FastAPI、HTTPException
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse

app = FastAPI()

def gen():
    try:
        for i in range(10):
            if i == 5:
                # 这里抛异常，但响应头已发出，客户端只会收到截断的响应
                raise ValueError("中途出错")
            yield f"line {i}\\n".encode("utf-8")
    except Exception:
        # 只能记录日志，没法改状态码了
        yield b"error occurred\\n"

@app.get("/stream-error")
def stream_error():
    # 想在流开始前校验，就在这里抛
    # raise HTTPException(400, "参数错误")  # 这个能正常返回 400
    return StreamingResponse(content=gen(), media_type="text/plain")
\`\`\`

### 10.4 客户端断开检测

客户端断开连接时，生成器的 \`yield\` 可能抛异常。要捕获处理。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

def gen():
    try:
        for i in range(1000):
            yield f"data {i}\\n".encode("utf-8")
    except Exception:
        # 客户端断开或其他错误
        # 这里清理资源（如关闭文件、数据库连接）
        pass

@app.get("/long-stream")
def long_stream():
    return StreamingResponse(content=gen(), media_type="text/plain")
\`\`\`

## 十一、各类响应对比

| 响应类 | 用途 | 特点 |
|---|---|---|
| \`JSONResponse\` | 返回 JSON | 默认，自动序列化 |
| \`PlainTextResponse\` | 返回文本 | text/plain |
| \`HTMLResponse\` | 返回 HTML | text/html |
| \`RedirectResponse\` | 重定向 | 301/302/307/308 |
| \`Response\` | 原始字节 | 完全自定义 |
| \`StreamingResponse\` | 流式响应 | 生成器，边生成边发 |
| \`FileResponse\` | 文件下载 | ASGI 优化，自动头 |

选择建议：
- 普通 JSON 接口：默认 \`JSONResponse\`（不用显式写）。
- 大文件下载：\`FileResponse\`。
- 流式生成（CSV、SSE、实时数据）：\`StreamingResponse\`。
- 完全自定义：\`Response\`。

## 十二、本章小结

流式响应是处理大数据、实时数据、文件下载的核心能力。掌握本章后你能：
- 用 \`StreamingResponse\` + 生成器实现流式输出，降低内存占用和首字节延迟。
- 用 \`FileResponse\` 高效返回文件，自动处理 \`Content-Length\`、\`ETag\`。
- 用 \`Content-Disposition\` 控制浏览器是下载还是预览。
- 实现 SSE 实时推送、CSV 流式导出、图片动态缩略图。
- 处理路径安全、错误处理、客户端断开等生产问题。

至此，FastAPI 的响应处理部分就完整了。从 response_model 的字段过滤，到状态码与 Header 的精细控制，到 Cookie/Session 的登录态管理，再到流式响应的大数据处理，你掌握了构建专业 Web API 响应层所需的全部技能。
`
  }
];
