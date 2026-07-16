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

### 生活类比：快递打包规格 📦

把 response_model 想象成**快递公司的打包规格单**：

- **数据库模型** = 仓库里完整的货物（有进货价、内部编号、库存量等商家信息）
- **response_model** = 快递面单上"对外展示"的字段（品名、收件人、重量）
- **过滤过程** = 打包时只把该让客户看到的放进箱子，进货价这类内部信息留在仓库

不管仓库里货物贴了多少标签（内部字段），打包时只按面单规格（response_model）装箱。客户拆快递时只能看到面单上列的字段，看不到仓库内部标签。这就是 response_model 的"出口过滤"。

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

### 7.1 嵌套字段的精细化 exclude/include（进阶）

Pydantic v2 支持用嵌套字典精确控制要排除/包含的嵌套字段，比单纯排除顶层字段更灵活。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建应用
app = FastAPI()

# 内层：商品模型
class Product(BaseModel):
    id: int                # 商品 ID
    name: str              # 商品名
    cost: float            # 成本价（内部字段，不对外）
    price: float           # 售价

# 内层：订单项（商品 + 数量）
class OrderItem(BaseModel):
    product: Product       # 嵌套商品
    quantity: int          # 数量
    subtotal: float        # 小计

# 外层：订单
class Order(BaseModel):
    id: int                          # 订单 ID
    user_id: int                     # 用户 ID（内部字段）
    items: list[OrderItem]           # 订单项列表
    total: float                     # 总价
    internal_note: str | None = None # 内部备注（不对外）

# 模拟订单数据
order_data = Order(
    id=1001,
    user_id=42,
    total=199.8,
    internal_note="VIP 客户，加急",
    items=[
        OrderItem(
            product=Product(id=1, name="鼠标", cost=30.0, price=99.9),
            quantity=2,
            subtotal=199.8,
        ),
    ],
)

# 方式一：用嵌套字典精确排除多层字段
# {"items": {"product": {"cost"}}} 表示排除 items 里每个 product 的 cost 字段
@app.get("/orders/{order_id}", response_model=Order,
         response_model_exclude={"user_id", "internal_note", "items": {"product": {"cost"}}})
def get_order(order_id: int):
    return order_data

# 方式二：用嵌套字典精确包含
# 只保留 id、total 和 items 里的 quantity、product 的 name
@app.get("/orders-summary/{order_id}", response_model=Order,
         response_model_include={"id", "total", "items": {"quantity", "product": {"name"}}})
def get_order_summary(order_id: int):
    return order_data
\`\`\`

访问 \`GET /orders/1001\` 返回（注意 \`cost\` 被排除了）：
\`\`\`json
{
  "id": 1001,
  "total": 199.8,
  "items": [
    {"product": {"id": 1, "name": "鼠标", "price": 99.9}, "quantity": 2, "subtotal": 199.8}
  ]
}
\`\`\`

访问 \`GET /orders-summary/1001\` 返回（只保留指定字段）：
\`\`\`json
{
  "id": 1001,
  "total": 199.8,
  "items": [{"product": {"name": "鼠标"}, "quantity": 2}]
}
\`\`\`

**要点**：嵌套字典的语法是 \`{"外层字段": {"内层字段": {"更内层字段"}}}\`，可以层层深入到任意层级。这是 Pydantic v2 的新特性，比 v1 更强大。

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

## 十一、别名映射 alias（高级用法）

实际项目里，数据库字段名（\`snake_case\`）和前端期望的 JSON 字段名（\`camelCase\`）经常不一致。Pydantic 的 \`alias\` 能优雅处理这种映射，配合 \`response_model_by_alias\` 控制输出时用哪个名字。

### 11.1 基础别名映射

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel、Field、ConfigDict
from pydantic import BaseModel, Field, ConfigDict

# 创建应用
app = FastAPI()

# 用 alias 把数据库的 snake_case 映射成前端的 camelCase
class UserOut(BaseModel):
    # model_config 配置模型行为
    # populate_by_name=True 允许同时用字段名和 alias 传入数据
    model_config = ConfigDict(populate_by_name=True)

    # Field(alias="userId") 表示 JSON 里用 "userId"，Python 里用 user_id
    user_id: int = Field(alias="userId")           # JSON: userId → Python: user_id
    user_name: str = Field(alias="userName")       # JSON: userName → Python: user_name
    created_at: str = Field(alias="createdAt")     # JSON: createdAt → Python: created_at
    is_active: bool = Field(alias="isActive")      # JSON: isActive → Python: is_active

# 模拟数据：内部用 snake_case（数据库风格）
fake_user = {
    "user_id": 1,
    "user_name": "alice",
    "created_at": "2026-07-13",
    "is_active": True,
}

# response_model_by_alias=True（默认就是 True）：输出用 alias 名（camelCase）
@app.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int):
    # 内部数据是 snake_case，但输出会变成 camelCase
    return fake_user

# response_model_by_alias=False：输出用字段名（snake_case）
@app.get("/users-raw/{user_id}", response_model=UserOut, response_model_by_alias=False)
def get_user_raw(user_id: int):
    return fake_user
\`\`\`

访问 \`GET /users/1\` 返回（camelCase，前端友好）：
\`\`\`json
{"userId": 1, "userName": "alice", "createdAt": "2026-07-13", "isActive": true}
\`\`\`

访问 \`GET /users-raw/1\` 返回（snake_case，Python 风格）：
\`\`\`json
{"user_id": 1, "user_name": "alice", "created_at": "2026-07-13", "is_active": true}
\`\`\`

### 11.2 输入和输出用不同别名（serialization_alias）

Pydantic v2 支持输入和输出用不同的别名：\`validation_alias\` 控制输入，\`serialization_alias\` 控制输出。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel、Field
from pydantic import BaseModel, Field

app = FastAPI()

class Product(BaseModel):
    # validation_alias：接收请求时匹配的字段名（前端传 old_id）
    # serialization_alias：响应输出时用的字段名（前端看到 new_id）
    # 这样能实现"老字段名接收，新字段名输出"的平滑迁移
    product_id: int = Field(
        validation_alias="old_id",       # 输入：前端传 old_id
        serialization_alias="new_id",    # 输出：返回 new_id
    )
    name: str

# 创建商品：前端传 old_id，但响应里返回 new_id
@app.post("/products", response_model=Product)
def create_product(product: Product):
    # product.product_id 能拿到值（用字段名访问）
    return product
\`\`\`

请求 \`POST /products\` 传 \`{"old_id": 1, "name": "鼠标"}\`，响应：
\`\`\`json
{"new_id": 1, "name": "鼠标"}
\`\`\`

这种"输入老名、输出新名"的技巧在 API 字段重命名迁移时非常有用：老客户端继续传旧字段名，新客户端看到新字段名，平滑过渡。

### 11.3 别名生成器 AliasGenerator（批量转换）

如果模型字段很多，手动给每个字段写 alias 太繁琐。Pydantic v2 的 \`AliasGenerator\` 能批量按规则生成别名。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel、ConfigDict、AliasGenerator
from pydantic import BaseModel, ConfigDict, AliasGenerator

app = FastAPI()

# 把 snake_case 自动转 camelCase 的工具函数
def to_camel(snake_str: str) -> str:
    """把 snake_case 转成 camelCase：user_name → userName"""
    # split("_") 分割，第一段不变，后续段首字母大写
    parts = snake_str.split("_")
    # parts[0] 原样，parts[1:] 每段首字母大写
    return parts[0] + "".join(word.capitalize() for word in parts[1:])

# 用 AliasGenerator 批量生成别名
class UserOut(BaseModel):
    model_config = ConfigDict(
        # AliasGenerator 自动给所有字段生成别名
        alias_generator=AliasGenerator(
            validation_alias=to_camel,      # 输入用 camelCase
            serialization_alias=to_camel,   # 输出也用 camelCase
        ),
        populate_by_name=True,              # 同时允许用字段名
    )
    user_id: int          # 自动别名 userId
    user_name: str        # 自动别名 userName
    created_at: str       # 自动别名 createdAt
    is_active: bool       # 自动别名 isActive

@app.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int):
    # 内部用 snake_case，输出自动变 camelCase
    return {
        "user_id": user_id,
        "user_name": "alice",
        "created_at": "2026-07-13",
        "is_active": True,
    }
\`\`\`

访问 \`GET /users/1\` 返回：
\`\`\`json
{"userId": 1, "userName": "alice", "createdAt": "2026-07-13", "isActive": true}
\`\`\`

\`AliasGenerator\` 让你不用给每个字段手写 alias，特别适合大模型批量转换命名风格。

## 十二、实战：完整的用户 API（UserCreate 输入、UserResponse 输出）

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

## 十三、常见错误（新手避坑）

### 错误 1：忘了声明 response_model，导致敏感字段泄漏

\`\`\`python
# ❌ 错误：没声明 response_model，password 直接返回给前端
@app.post("/users")
def create_user(user: UserCreate):
    db_user = save_to_db(user)  # db_user 含 hashed_password
    return db_user  # 前端能拿到 hashed_password！

# ✅ 正确：声明 response_model=UserOut，自动过滤
@app.post("/users", response_model=UserOut)
def create_user(user: UserCreate):
    db_user = save_to_db(user)
    return db_user  # response_model 过滤掉 hashed_password
\`\`\`

### 错误 2：response_model 和返回值字段名对不上

\`\`\`python
# ❌ 错误：返回的 dict 字段名和模型不一致，字段会丢失
class UserOut(BaseModel):
    username: str
    email: str

@app.get("/users", response_model=UserOut)
def get_user():
    # 返回的 dict 用 user_name（下划线），模型用 username（无下划线）
    # 字段名不匹配，username 会被过滤成缺失，触发校验错误
    return {"user_name": "alice", "email": "a@b.com"}  # 422 错误！

# ✅ 正确：字段名完全一致
@app.get("/users", response_model=UserOut)
def get_user():
    return {"username": "alice", "email": "a@b.com"}
\`\`\`

### 错误 3：include 和 exclude 同时用

\`\`\`python
# ❌ 错误：include 和 exclude 互斥，同时用行为未定义
@app.get("/users", response_model=User,
         response_model_include={"id"}, response_model_exclude={"password"})
def get_users():
    return user  # 行为不可预测，可能两个都不生效

# ✅ 正确：只选一个用
@app.get("/users", response_model=User, response_model_exclude={"password"})
def get_users():
    return user
\`\`\`

### 错误 4：StreamingResponse 上用 response_model 不生效

\`\`\`python
# ❌ 错误：StreamingResponse 是字节流，response_model 不会过滤
@app.get("/stream", response_model=UserOut)
def stream():
    return StreamingResponse(...)  # response_model 被忽略
\`\`\`

## 十四、动手实验

### 实验 1：实现一个"字段脱敏"接口

要求：定义一个 \`User\` 模型含 \`phone\` 字段，输出时把手机号中间 4 位替换成 \`****\`。

提示：用 \`@field_serializer\` 装饰器自定义字段的序列化逻辑。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel、field_serializer
from pydantic import BaseModel, field_serializer

app = FastAPI()

class UserOut(BaseModel):
    id: int
    username: str
    phone: str  # 原始手机号

    # @field_serializer 自定义字段序列化逻辑
    # 这里在输出 phone 时做脱敏处理
    @field_serializer("phone")
    def mask_phone(self, phone: str) -> str:
        """把 13812345678 脱敏成 138****5678"""
        # phone[:3] 取前 3 位，phone[-4:] 取后 4 位
        if len(phone) == 11:
            return phone[:3] + "****" + phone[-4:]
        return phone

@app.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int):
    # 内部数据是完整手机号
    return {"id": user_id, "username": "alice", "phone": "13812345678"}

# 访问 /users/1 返回 {"id":1,"username":"alice","phone":"138****5678"}
\`\`\`

### 实验 2：用 alias 实现 camelCase 输出

要求：内部模型用 \`snake_case\`，但 API 输出用 \`camelCase\`，用 \`AliasGenerator\` 批量转换。

\`\`\`python
# 参考 11.3 节的 AliasGenerator 示例，自己扩展一个含 5 个字段的模型
# 测试：访问接口，确认所有字段都变成 camelCase
\`\`\`

### 实验 3：用 exclude_unset 实现 PATCH 部分更新

要求：实现一个 PATCH 接口，客户端只传需要更新的字段，未传的字段保持原值。

提示：
1. 输入模型所有字段设为 \`| None = None\`
2. 用 \`model_dump(exclude_unset=True)\` 只取客户端传了的字段
3. 用 \`model_copy(update=update_data)\` 应用更新

## 十五、response_model 使用清单

| 场景 | 推荐做法 |
|---|---|
| 防止敏感字段泄漏 | 定义不含敏感字段的 \`XxxOut\` 模型，设为 response_model |
| 同模型不同字段 | \`response_model_include\` / \`response_model_exclude\` |
| 嵌套字段精确控制 | 嵌套字典 \`{"items": {"product": {"cost"}}}\` |
| PATCH 部分更新 | \`response_model_exclude_unset=True\` |
| 可选字段不输出 | \`response_model_exclude_none=True\` |
| 嵌套数据 | 内层和外层各定义输出模型，response_model 递归过滤 |
| 字段名映射 | \`Field(alias=...)\` + \`response_model_by_alias=True\` |
| 批量命名转换 | \`AliasGenerator\` + \`ConfigDict\` |
| 动态返回结构 | \`response_model=None\` 关闭过滤 |
| 列表响应 | \`response_model=list[ItemOut]\` |
| 字段脱敏 | \`@field_serializer\` 自定义序列化 |
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

### 生活类比：邮政系统的信件投递状态 📮

把 HTTP 状态码想象成**邮局给寄件人的回执单**：

- **2xx 成功** = 信件已送达（200 签收、201 新地址已建档、204 送达但收件人没回信）
- **3xx 重定向** = 信件被转寄（301 永久转新地址、302 临时转一次）
- **4xx 客户端错误** = 寄件人写错了（400 地址格式错、401 没贴邮票、403 没权限寄到这、404 地址不存在、422 信封格式不对）
- **5xx 服务端错误** = 邮局出问题（500 邮局系统故障、503 邮局暂时关门）

每个状态码都是"邮局"（服务器）给"寄件人"（客户端）的标准化反馈，让双方用统一语言沟通。

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
- **410 Gone**：资源已永久删除（比 404 更明确）。
- **422 Unprocessable Entity**：FastAPI 默认的校验失败状态码。
- **429 Too Many Requests**：请求过于频繁（限流）。
- **500 Internal Server Error**：服务端内部错误。
- **503 Service Unavailable**：服务暂不可用（维护中）。

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

### 2.3 用 status_code 作为函数参数（动态状态码进阶）

FastAPI 还支持把 \`status_code\` 声明为路由函数的参数，根据业务逻辑动态决定。这比 Response 对象更声明式。

\`\`\`python
# 从 fastapi 导入 FastAPI、Response、status
from fastapi import FastAPI, Response, status
# 从 typing 导入 Annotated 用于类型注解
from typing import Annotated

app = FastAPI()

# Annotated[int, status_code] 把 status_code 标记为状态码参数
# 函数返回的整数值会被设为响应状态码
@app.post("/items", status_code=201)
def create_item(response: Response):
    # 也可以在函数内动态修改 response.status_code
    response.status_code = status.HTTP_201_CREATED
    return {"id": 1}
\`\`\`

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
- **CORS**：\`Access-Control-Allow-Origin\`。

### 3.3 限流响应头完整示例

\`\`\`python
# 从 fastapi 导入 FastAPI、Response、Header、HTTPException、status
from fastapi import FastAPI, Response, Header, HTTPException, status
# 导入 time 用于时间窗口
import time

app = FastAPI()

# 简单的内存限流器（实际项目用 Redis）
# 字典存储每个客户端的请求记录：{client_id: [timestamp1, timestamp2, ...]}
rate_limit_store: dict[str, list[float]] = {}
RATE_LIMIT = 5          # 每分钟最多 5 次
RATE_WINDOW = 60        # 时间窗口 60 秒

def check_rate_limit(client_id: str) -> tuple[bool, int, int]:
    """
    检查是否超过限流
    :return: (是否允许, 剩余次数, 重置时间秒)
    """
    now = time.time()
    # 取出该客户端的请求历史
    requests = rate_limit_store.get(client_id, [])
    # 过滤掉时间窗口外的请求
    requests = [t for t in requests if now - t < RATE_WINDOW]
    # 计算剩余次数
    remaining = RATE_LIMIT - len(requests)
    if len(requests) >= RATE_LIMIT:
        # 超过限流
        reset_at = int(RATE_WINDOW - (now - requests[0]))
        return False, 0, max(reset_at, 0)
    # 允许请求，记录这次请求
    requests.append(now)
    rate_limit_store[client_id] = requests
    return True, remaining, RATE_WINDOW

@app.get("/api/limited")
def limited_api(
    response: Response,
    # 从请求头读 X-Client-Id 作为客户端标识
    x_client_id: str = Header(..., alias="X-Client-Id"),
):
    allowed, remaining, reset_in = check_rate_limit(x_client_id)
    # 在响应头返回限流信息（标准做法）
    response.headers["X-RateLimit-Limit"] = str(RATE_LIMIT)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Reset"] = str(reset_in)
    if not allowed:
        # 429 Too Many Requests 表示限流
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="请求过于频繁，请稍后再试",
            headers={"Retry-After": str(reset_in)},  # 建议客户端等待秒数
        )
    return {"message": "请求成功", "remaining": remaining}
\`\`\`

测试：
\`\`\`bash
# 连续请求 6 次，第 6 次会被限流
curl -H "X-Client-Id: client-1" http://localhost:8000/api/limited
curl -H "X-Client-Id: client-1" http://localhost:8000/api/limited
curl -H "X-Client-Id: client-1" http://localhost:8000/api/limited
curl -H "X-Client-Id: client-1" http://localhost:8000/api/limited
curl -H "X-Client-Id: client-1" http://localhost:8000/api/limited
curl -H "X-Client-Id: client-1" http://localhost:8000/api/limited  # 这次返回 429
\`\`\`

\`X-RateLimit-*\` 头是限流 API 的标准做法，\`Retry-After\` 告诉客户端等待多久再重试。

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
\`\`\`bash
# v1 版本：返回 name 字段
curl -H "X-API-Version: 1" http://localhost:8000/users/1
# 输出: {"id":1,"name":"alice","email":"a@b.com"}

# v2 版本：返回 username 和 full_name
curl -H "X-API-Version: 2" http://localhost:8000/users/1
# 输出: {"id":1,"username":"alice","email":"a@b.com","full_name":"Alice Liddell","avatar":null}
\`\`\`

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

## 九、更多状态码实战示例

### 9.1 409 Conflict（冲突）

创建资源时检查唯一性冲突，用 409 而不是 400 更语义化。

\`\`\`python
# 从 fastapi 导入 FastAPI、HTTPException、status
from fastapi import FastAPI, HTTPException, status
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

app = FastAPI()

class UserCreate(BaseModel):
    username: str    # 用户名
    email: str       # 邮箱

# 模拟数据库
existing_users = {"alice", "bob"}

@app.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate):
    # 检查用户名是否已存在
    if user.username in existing_users:
        # 409 Conflict：资源已存在，冲突
        # 比 400 更语义化，明确告诉客户端"冲突"
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"用户名 {user.username} 已存在",
        )
    existing_users.add(user.username)
    return {"username": user.username, "created": True}
\`\`\`

### 9.2 410 Gone（资源已永久删除）

比 404 更明确：404 是"不知道有没有"，410 是"曾经有但现在永久删了"。

\`\`\`python
# 从 fastapi 导入 FastAPI、HTTPException、status
from fastapi import FastAPI, HTTPException, status

app = FastAPI()

# 已删除的文章 ID 集合（永久删除记录）
deleted_articles = {"old-post-1", "old-post-2"}

@app.get("/articles/{article_id}")
def get_article(article_id: str):
    if article_id in deleted_articles:
        # 410 Gone：资源曾经存在但已被永久删除
        # 比 404 更明确，客户端可以清理本地缓存
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="该文章已被永久删除",
        )
    # 正常逻辑...
    return {"article_id": article_id}
\`\`\`

### 9.3 422 与自定义校验错误

FastAPI 默认用 422 表示校验失败。也可以在业务逻辑里手动抛 422。

\`\`\`python
# 从 fastapi 导入 FastAPI、HTTPException、status
from fastapi import FastAPI, HTTPException, status

app = FastAPI()

@app.post("/transfer")
def transfer(amount: float):
    # 业务校验：转账金额必须大于 0
    if amount <= 0:
        # 422 Unprocessable Entity：数据格式对但语义不对
        # 比 400 更明确：参数解析成功但业务规则不通过
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="转账金额必须大于 0",
        )
    return {"amount": amount, "status": "transferred"}
\`\`\`

## 十、常见错误（新手避坑）

### 错误 1：用魔法数字而非常量

\`\`\`python
# ❌ 错误：用数字 404，看不出含义
@app.get("/users/{user_id}")
def get_user(user_id: int):
    raise HTTPException(status_code=404, detail="不存在")

# ✅ 正确：用 status 常量，语义清晰
from fastapi import status
raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="不存在")
\`\`\`

### 错误 2：DELETE 返回了 body 但状态码是 204

\`\`\`python
# ❌ 错误：204 不应有 body，但返回了 dict
@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int):
    del items[item_id]
    return {"deleted": True}  # 204 不应返回 body！

# ✅ 正确：204 返回 None
@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int):
    del items[item_id]
    return None
\`\`\`

### 错误 3：401 和 403 混淆

\`\`\`python
# ❌ 错误：没登录用 403
if not current_user:
    raise HTTPException(status_code=403, detail="禁止访问")  # 应该用 401

# ✅ 正确：401 是"没认证"（没登录），403 是"已认证但没权限"
if not current_user:
    raise HTTPException(status_code=401, detail="请先登录")
if current_user.role != "admin":
    raise HTTPException(status_code=403, detail="需要管理员权限")
\`\`\`

### 错误 4：Header 参数名没加 alias

\`\`\`python
# ❌ 错误：参数名 user_agent 默认匹配 User-Agent（靠下划线转连字符）
# 但行为隐晦，容易出 bug
@app.get("/api")
def api(user_agent: str = Header(...)):  # 隐式转换，不推荐
    return user_agent

# ✅ 正确：显式 alias，清晰明确
@app.get("/api")
def api(user_agent: str = Header(..., alias="User-Agent")):  # 显式指定
    return user_agent
\`\`\`

## 十一、动手实验

### 实验 1：实现带限流的 API

要求：用 \`X-RateLimit-*\` 头实现一个限流接口，每分钟最多 10 次请求，超过返回 429。

提示：参考 3.3 节的限流示例，把 \`RATE_LIMIT\` 改成 10。

### 实验 2：实现 ETag 缓存

要求：给一个文章接口加 ETag，客户端带 \`If-None-Match\` 且匹配时返回 304。

\`\`\`python
# 提示代码框架
@app.get("/articles/{article_id}")
def get_article(article_id: str, response: Response,
                if_none_match: str | None = Header(None, alias="If-None-Match")):
    article = db[article_id]
    # 用文章内容生成 ETag（hashlib.md5）
    import hashlib
    etag = '"' + hashlib.md5(article.content.encode()).hexdigest() + '"'
    response.headers["ETag"] = etag
    if if_none_match == etag:
        response.status_code = status.HTTP_304_NOT_MODIFIED
        return None
    return article
\`\`\`

### 实验 3：实现 upsert 接口

要求：实现一个 PUT 接口，资源不存在则创建（201），存在则更新（200）。

提示：用 \`Response\` 参数动态设置状态码。

## 十二、状态码选择速查表

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

### 生活类比：超市会员卡 🎫

把 Cookie 想象成**超市发的会员卡**：

- **Set-Cookie** = 收银台给你一张会员卡（卡上有卡号、有效期）
- **浏览器存储** = 你把卡放钱包里
- **自动携带 Cookie** = 下次进店刷会员卡（不用每次重新登记）
- **HttpOnly** = 卡只能用不能看（防 XSS：JS 读不到卡号）
- **Secure** = 卡只能走 VIP 通道（仅 HTTPS 传输）
- **SameSite** = 卡只能在本店用（防 CSRF：跨店不能用）
- **Max-Age** = 卡的有效期（到期作废）
- **Session** = 超市后台的会员档案（卡号对应档案里的消费记录）

会员卡（Cookie）只是个"身份证号"，真正的会员信息存在超市后台（服务器 Session）。卡丢了补一张（重新登录），但消费记录还在。

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

### 3.3 Set-Cookie 与 Cookie 读取的完整示例

把"设置 Cookie"和"读取 Cookie"串起来，做一个完整的往返示例。

\`\`\`python
# 从 fastapi 导入 FastAPI、Response、Cookie、HTTPException、status
from fastapi import FastAPI, Response, Cookie, HTTPException, status
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 导入时间相关
from datetime import datetime, timedelta, timezone

# 创建应用
app = FastAPI()

# ============ 模型 ============
class LoginRequest(BaseModel):
    username: str    # 用户名
    password: str    # 密码

# ============ 设置 Cookie 的完整示例 ============

@app.post("/login-full")
def login_full(req: LoginRequest, response: Response):
    """登录：设置各种 Cookie 演示"""
    # 模拟登录校验
    if req.username != "alice" or req.password != "123456":
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    # 1. 设置会话 Cookie（HttpOnly + Secure + SameSite）
    response.set_cookie(
        key="session_id",
        value="session_abc123",
        max_age=3600,           # 1 小时
        httponly=True,          # 防 XSS
        secure=False,           # 开发环境 False，生产改 True
        samesite="lax",         # 防 CSRF
        path="/",
    )

    # 2. 设置用户偏好 Cookie（非敏感，允许 JS 读）
    response.set_cookie(
        key="theme",
        value="dark",           # 主题：dark/light
        max_age=86400 * 30,     # 30 天（偏好持久化）
        httponly=False,         # 允许 JS 读（前端要切换主题）
        samesite="lax",
        path="/",
    )

    # 3. 设置语言偏好 Cookie
    response.set_cookie(
        key="lang",
        value="zh-CN",
        max_age=86400 * 30,     # 30 天
        httponly=False,
        path="/",
    )

    # 4. 设置用 Expires（绝对过期时间）而非 max_age
    # expires 接受 datetime 对象
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    response.set_cookie(
        key="csrf_token",
        value="csrf_xyz789",
        expires=expires_at,      # 绝对过期时间（datetime 对象）
        httponly=True,
        samesite="strict",       # 严格模式，防 CSRF
        path="/",
    )

    return {
        "message": "登录成功",
        "cookies_set": ["session_id", "theme", "lang", "csrf_token"],
    }

# ============ 读取 Cookie 的完整示例 ============

@app.get("/check-cookies")
def check_cookies(
    # 用 Cookie() 依赖读取每个 Cookie
    session_id: str | None = Cookie(None),
    theme: str | None = Cookie(None),
    lang: str | None = Cookie(None),
    csrf_token: str | None = Cookie(None),
):
    """读取所有设置的 Cookie"""
    return {
        "session_id": session_id,    # 会话 ID
        "theme": theme,              # 主题
        "lang": lang,                # 语言
        "csrf_token": csrf_token,    # CSRF token
        "all_present": all([session_id, theme, lang, csrf_token]),
    }

# ============ 通过 Request 对象读取所有 Cookie ============

from fastapi import Request

@app.get("/all-cookies")
def all_cookies(request: Request):
    """用 request.cookies 读取所有 Cookie（不依赖 Cookie()）"""
    # request.cookies 是 Cookies 对象，类似字典
    # 适合"不知道有哪些 Cookie"的场景
    return {
        "cookie_count": len(request.cookies),
        "cookies": dict(request.cookies),  # 转成普通字典返回
    }

# ============ 单独删除某个 Cookie ============

@app.post("/logout-full")
def logout_full(response: Response):
    """登出：删除所有相关 Cookie"""
    # delete_cookie 要逐个删，path 要和设置时一致
    response.delete_cookie(key="session_id", path="/")
    response.delete_cookie(key="theme", path="/")
    response.delete_cookie(key="lang", path="/")
    response.delete_cookie(key="csrf_token", path="/")
    return {"message": "已登出，所有 Cookie 已清除"}
\`\`\`

测试流程：
\`\`\`bash
# 1. 登录，服务器设置多个 Cookie
curl -c cookies.txt -X POST http://localhost:8000/login-full \\
  -H "Content-Type: application/json" \\
  -d '{"username":"alice","password":"123456"}'

# 2. 用保存的 Cookie 访问受保护接口
curl -b cookies.txt http://localhost:8000/check-cookies

# 3. 查看所有 Cookie
curl -b cookies.txt http://localhost:8000/all-cookies

# 4. 登出，清除 Cookie
curl -b cookies.txt -c cookies.txt -X POST http://localhost:8000/logout-full
\`\`\`

\`curl -c\` 保存响应里的 Cookie 到文件，\`curl -b\` 从文件读 Cookie 发送。这样能模拟浏览器的 Cookie 行为。

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

## 七、Cookie 与 Header 配合实战：Bearer Token + Cookie 双模式

有些 API 需要同时支持两种认证方式：浏览器用 Cookie，移动端用 Bearer Token。下面演示如何实现。

\`\`\`python
# 从 fastapi 导入 FastAPI、Cookie、Header、HTTPException、status、Depends
from fastapi import FastAPI, Cookie, Header, HTTPException, status, Depends
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel
# 从 itsdangerous 导入签名器
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

app = FastAPI()

SECRET_KEY = "dev-secret"
serializer = URLSafeTimedSerializer(SECRET_KEY, salt="auth")

class SessionData(BaseModel):
    user_id: int       # 用户 ID
    username: str      # 用户名
    role: str = "user" # 角色

# 有效 Bearer Token 集合（实际存 Redis/DB）
VALID_TOKENS = {
    "bearer-token-abc": SessionData(user_id=1, username="alice", role="user"),
    "bearer-token-admin": SessionData(user_id=2, username="admin", role="admin"),
}

def get_current_user(
    # 优先从 Cookie 读（浏览器场景）
    session: str | None = Cookie(None),
    # 其次从 Authorization 头读（移动端场景）
    authorization: str | None = Header(None, alias="Authorization"),
) -> SessionData:
    """
    双模式认证：Cookie 或 Bearer Token 任一即可
    """
    # 方式一：Cookie Session（浏览器）
    if session:
        try:
            data = serializer.loads(session, max_age=3600)
            return SessionData(**data)
        except (BadSignature, SignatureExpired):
            pass  # Cookie 无效，继续尝试 token

    # 方式二：Bearer Token（移动端）
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]  # 去掉 "Bearer " 前缀
        if token in VALID_TOKENS:
            return VALID_TOKENS[token]

    # 两种方式都失败，返回 401
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="未认证，请提供 Cookie 或 Bearer Token",
        headers={"WWW-Authenticate": "Bearer"},
    )

# 这个接口同时支持 Cookie 和 Bearer Token
@app.get("/me")
def me(user: SessionData = Depends(get_current_user)):
    return {"user": user.model_dump()}
\`\`\`

测试两种方式：
\`\`\`bash
# 方式一：用 Cookie 访问（先登录拿到 Cookie）
curl -b cookies.txt http://localhost:8000/me

# 方式二：用 Bearer Token 访问
curl -H "Authorization: Bearer bearer-token-abc" http://localhost:8000/me
\`\`\`

## 八、Cookie 安全注意事项

### 8.1 常见攻击与防御

| 攻击 | 原理 | 防御 |
|---|---|---|
| **XSS 偷 Cookie** | JS 读 \`document.cookie\` 发给攻击者 | \`HttpOnly=True\` |
| **中间人窃听** | HTTP 明文传输被抓包 | \`Secure=True\`（仅 HTTPS） |
| **CSRF** | 攻击者诱导用户点链接发跨站请求 | \`SameSite=Lax/Strict\` + CSRF Token |
| **Cookie 篡改** | 客户端改 Cookie 值 | 服务端签名（itsdangerous / JWT） |
| **会话固定** | 攻击者预设 session_id | 登录后重新生成 session_id |
| **会话劫持** | 偷到 session_id 冒充 | HTTPS + IP/UA 绑定 + 短有效期 |

### 8.2 安全配置清单

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

### 8.3 Session 续期策略

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

## 九、常见错误（新手避坑）

### 错误 1：Cookie 设置了但读不到（path 不一致）

\`\`\`python
# ❌ 错误：设置时 path="/api"，删除时 path="/"
response.set_cookie(key="session", value="abc", path="/api")
response.delete_cookie(key="session", path="/")  # 删不掉！path 不匹配

# ✅ 正确：path 要完全一致
response.set_cookie(key="session", value="abc", path="/api")
response.delete_cookie(key="session", path="/api")  # path 一致才能删
\`\`\`

### 错误 2：生产环境没加 Secure

\`\`\`python
# ❌ 错误：生产环境 secure=False，HTTP 也能传 Cookie，被抓包就泄漏
response.set_cookie(key="session", value=token, secure=False)

# ✅ 正确：生产环境必须 secure=True，仅 HTTPS 传输
response.set_cookie(key="session", value=token, secure=True)
\`\`\`

### 错误 3：Cookie 存敏感数据且没签名

\`\`\`python
# ❌ 错误：直接把 user_id 存 Cookie，客户端能改
response.set_cookie(key="user_id", value="1")
# 客户端改成 value="2" 就能冒充其他用户！

# ✅ 正确：用签名 Cookie，篡改会被发现
signed = serializer.dumps({"user_id": 1})
response.set_cookie(key="session", value=signed, httponly=True)
\`\`\`

### 错误 4：Cookie() 参数名和实际 Cookie 名不匹配

\`\`\`python
# ❌ 错误：Cookie 名是 "session_id"，但参数名是 "sessionId"
@app.get("/me")
def me(sessionId: str | None = Cookie(None)):  # 读不到！
    return sessionId

# ✅ 正确：参数名要和 Cookie 名完全一致
@app.get("/me")
def me(session_id: str | None = Cookie(None)):  # 匹配 "session_id"
    return session_id

# 或者用 alias 显式指定
@app.get("/me")
def me(sid: str | None = Cookie(None, alias="session_id")):
    return sid
\`\`\`

### 错误 5：登录后没重新生成 session_id（会话固定攻击）

\`\`\`python
# ❌ 错误：用户登录前就有 session_id，登录后还用同一个
# 攻击者可能预设了 session_id，登录后就能冒充
@app.post("/login")
def login(response: Response):
    # 用客户端传来的 session_id（危险！）
    pass

# ✅ 正确：登录成功后生成新的 session_id
@app.post("/login")
def login(response: Response):
    new_session_id = generate_new_id()  # 重新生成
    response.set_cookie(key="session_id", value=new_session_id)
\`\`\`

## 十、动手实验

### 实验 1：实现"记住我"功能

要求：登录时如果勾选"记住我"，Session 有效期 30 天；不勾选则只在浏览器会话期间有效（关闭浏览器就失效）。

提示：
- "记住我" → \`max_age=86400*30\`（30 天）
- 不勾选 → 不设 \`max_age\`（会话 Cookie，浏览器关闭即失效）

\`\`\`python
# 参考代码框架
class LoginRequest(BaseModel):
    username: str
    password: str
    remember_me: bool = False    # 是否记住我

@app.post("/login")
def login(req: LoginRequest, response: Response):
    # ... 校验密码 ...
    if req.remember_me:
        max_age = 86400 * 30  # 30 天
    else:
        max_age = None  # 会话 Cookie（浏览器关闭即失效）
    response.set_cookie(
        key="session",
        value=signed_value,
        max_age=max_age,     # None 表示会话 Cookie
        httponly=True,
        samesite="lax",
        path="/",
    )
\`\`\`

### 实验 2：实现用户偏好持久化

要求：用 Cookie 存储用户的主题（dark/light）和语言（zh/en）偏好，下次访问自动恢复。

提示：这些是非敏感数据，可以 \`httponly=False\` 让前端 JS 读取切换。

### 实验 3：实现 Cookie + Bearer Token 双模式认证

要求：参考第七节，实现一个接口同时支持 Cookie 和 Bearer Token 两种认证方式。

测试：用 \`curl -b\` 测 Cookie，用 \`curl -H "Authorization: Bearer xxx"\` 测 Token。

## 十一、Cookie vs Session vs Token 对比

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

## 十二、本章小结

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

### 生活类比：水龙头 vs 水桶 🚰

把响应方式想象成**取水**：

- **一次性返回（传统）** = 用水桶接水：要等水桶装满才能拎走，桶小装不下大水量（内存爆炸），等的时间长（首字节延迟高）
- **流式响应** = 打开水龙头：水一来就流，边流边用，不用等满桶，多大水量都不怕（内存恒定），立即有水用（首字节延迟低）
- **StreamingResponse** = 你自己控制水龙头开度（生成器 yield 控制每块大小）
- **FileResponse** = 自来水公司的管道直送（ASGI 优化，零拷贝，性能最好）
- **SSE** = 滴漏式水龙头（持续小水流，服务器持续推送）

流式响应的核心思想：**不用攒齐再发，来一块发一块**。

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

### 2.3 实时数据流：日志推送

流式响应的另一个经典场景是**实时日志推送**：服务器持续生成日志，客户端实时接收。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入 StreamingResponse
from fastapi.responses import StreamingResponse
# 导入 time 和 datetime
import time
from datetime import datetime

# 创建应用
app = FastAPI()

# 模拟实时日志生成器
def generate_logs():
    """
    持续生成日志，模拟系统运行时的实时输出
    实际项目可能从消息队列、日志文件 tail、数据库读取
    """
    log_levels = ["INFO", "WARN", "ERROR", "DEBUG"]
    counter = 0
    # 无限循环（实际要有退出条件，如客户端断开或达到上限）
    while counter < 50:
        # 生成时间戳
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        # 随机选一个日志级别
        level = log_levels[counter % len(log_levels)]
        # 构造日志行
        log_line = f"[{timestamp}] {level} 事件 #{counter}: 系统运行中...\\n"
        # yield 这一行日志
        yield log_line.encode("utf-8")
        counter += 1
        # 间隔 0.5 秒，模拟实时产生
        time.sleep(0.5)

# 实时日志接口
@app.get("/stream/logs")
def stream_logs():
    return StreamingResponse(
        content=generate_logs(),
        media_type="text/plain",            # 纯文本流
        headers={
            # 禁用缓冲，让数据立即发送
            "X-Accel-Buffering": "no",      # Nginx 禁用缓冲
            "Cache-Control": "no-cache",    # 不缓存
        },
    )
\`\`\`

访问 \`GET /stream/logs\`，客户端会持续收到日志行，每 0.5 秒一行，直到 50 条结束。这种模式适合监控系统、日志查看器。

### 2.4 异步生成器（适合 IO 密集场景）

异步生成器（\`async def\` + \`yield\`）也支持，适合 IO 密集场景（如异步查数据库）。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入 StreamingResponse
from fastapi.responses import StreamingResponse
# 导入 asyncio
import asyncio

# 创建应用
app = FastAPI()

# 异步生成器
async def async_generate():
    """异步生成器：适合 IO 密集场景"""
    for i in range(5):
        # 模拟异步 IO（如 await db.fetch_one()）
        # asyncio.sleep 是非阻塞的，期间能让出 CPU 给其他请求
        await asyncio.sleep(1)
        yield f"async chunk {i}\\n".encode("utf-8")

@app.get("/async-stream")
def async_stream():
    # StreamingResponse 自动识别异步生成器
    return StreamingResponse(content=async_generate(), media_type="text/plain")
\`\`\`

**同步 vs 异步生成器**：
- 同步生成器（\`def\` + \`yield\`）：会阻塞整个线程，适合 CPU 密集或简单场景。
- 异步生成器（\`async def\` + \`yield\`）：非阻塞，适合 IO 密集（查数据库、调 API、读文件）。

## 三、大文件分块下载

大文件下载是流式响应的经典场景。**不要 \`open().read()\` 全读进内存**，要分块读取、分块发送。

### 3.1 基础大文件下载

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

### 3.2 增强大文件下载：支持断点续传（Range 请求）

生产级文件下载要支持**断点续传**：客户端中断后能从断点继续下载，不用从头开始。HTTP 用 \`Range\` 请求头和 \`206 Partial Content\` 状态码实现。

\`\`\`python
# 从 fastapi 导入 FastAPI、Header、HTTPException、status、Request
from fastapi import FastAPI, Header, HTTPException, status, Request
# 从 fastapi.responses 导入 StreamingResponse
from fastapi.responses import StreamingResponse
# 从 pathlib 导入 Path
from pathlib import Path
# 导入 os
import os

app = FastAPI()
FILES_DIR = Path("files")

def parse_range_header(range_header: str, file_size: int) -> tuple[int, int]:
    """
    解析 Range 请求头，返回 (start, end) 字节范围
    Range 头格式：bytes=0-1023（前 1024 字节）
    或 bytes=1024-（从 1024 到末尾）
    或 bytes=-512（最后 512 字节）
    """
    # 只处理 bytes= 开头的格式
    if not range_header.startswith("bytes="):
        raise ValueError("不支持的 Range 格式")
    # 去掉 "bytes=" 前缀，按 "-" 分割
    range_spec = range_header[6:]
    parts = range_spec.split("-")
    start_str, end_str = parts[0], parts[1]

    # 解析起始位置
    if start_str == "":
        # bytes=-512：最后 512 字节
        start = file_size - int(end_str)
        end = file_size - 1
    else:
        start = int(start_str)
        # 解析结束位置
        if end_str == "":
            # bytes=1024-：从 1024 到末尾
            end = file_size - 1
        else:
            end = int(end_str)

    # 边界检查
    if start < 0 or start >= file_size or end >= file_size:
        raise ValueError("Range 超出文件范围")
    return start, end

def range_iterator(file_path: str, start: int, end: int, chunk_size: int = 64 * 1024):
    """
    从指定位置开始读取文件，分块 yield
    """
    # 打开文件，seek 到起始位置
    with open(file_path, "rb") as f:
        f.seek(start)
        remaining = end - start + 1  # 要读取的总字节数
        while remaining > 0:
            # 每次读 chunk_size 或剩余字节中较小的
            read_size = min(chunk_size, remaining)
            chunk = f.read(read_size)
            if not chunk:
                break
            yield chunk
            remaining -= len(chunk)

# 支持断点续传的下载接口
@app.get("/download/{filename}")
def download_with_range(filename: str, request: Request):
    # 安全路径拼接（防目录穿越）
    file_path = (FILES_DIR / filename).resolve()
    try:
        file_path.relative_to(FILES_DIR.resolve())
    except ValueError:
        raise HTTPException(status_code=400, detail="非法路径")
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")

    file_size = file_path.stat().st_size
    # 读取 Range 请求头
    range_header = request.headers.get("Range")

    if range_header:
        # 客户端请求部分内容（断点续传）
        try:
            start, end = parse_range_header(range_header, file_size)
        except ValueError:
            # Range 无效返回 416 Range Not Satisfiable
            raise HTTPException(
                status_code=416,
                detail="Range 越界",
                headers={"Content-Range": f"bytes */{file_size}"},
            )
        # 206 Partial Content：返回部分内容
        content_length = end - start + 1
        return StreamingResponse(
            content=range_iterator(str(file_path), start, end),
            status_code=206,                            # 206 表示部分内容
            media_type="application/octet-stream",
            headers={
                "Content-Range": f"bytes {start}-{end}/{file_size}",  # 内容范围
                "Content-Length": str(content_length),
                "Accept-Ranges": "bytes",               # 告诉客户端支持断点续传
                "Content-Disposition": f'attachment; filename="{filename}"',
            },
        )
    else:
        # 没有 Range 头，返回完整文件（200）
        return StreamingResponse(
            content=range_iterator(str(file_path), 0, file_size - 1),
            media_type="application/octet-stream",
            headers={
                "Content-Length": str(file_size),
                "Accept-Ranges": "bytes",               # 声明支持断点续传
                "Content-Disposition": f'attachment; filename="{filename}"',
            },
        )
\`\`\`

测试断点续传：
\`\`\`bash
# 第一次请求，下载前 100 字节
curl -H "Range: bytes=0-99" http://localhost:8000/download/bigfile.zip -o part1.bin
# 返回 206，Content-Range: bytes 0-99/1000000

# 第二次请求，从 100 字节继续
curl -H "Range: bytes=100-" http://localhost:8000/download/bigfile.zip -o part2.bin
# 返回 206，从 100 字节到文件末尾

# 合并两个部分
cat part1.bin part2.bin > bigfile.zip
\`\`\`

\`Accept-Ranges: bytes\` 告诉客户端"我支持断点续传"，下载工具（如 wget、迅雷）会利用这个头实现多线程下载和断点续传。

### 3.3 路径安全校验

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
    # bytes 字面量只能含 ASCII，中文要用 .encode("utf-8") 转成 bytes
    content = "<h1>Hello</h1><p>这是一段 HTML</p>".encode("utf-8")
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
    return "<h1>你好，HTML</h1><p>这是 HTML 内容</p>"

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
    output.seek(0)
    output.truncate(0)
    # 分批写数据
    count = 0
    for user in fetch_users(limit=1000):
        # 写一行 CSV
        writer.writerow([user["id"], user["username"], user["email"], user["created_at"]])
        count += 1
        # 每攒 100 行 yield 一次，平衡性能和内存
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
IMAGES_DIR = Path("images")
IMAGES_DIR.mkdir(exist_ok=True)

# 模拟创建一张测试图片
def ensure_sample_image():
    """确保有一张示例图片"""
    sample = IMAGES_DIR / "sample.jpg"
    if not sample.exists():
        try:
            from PIL import Image, ImageDraw
            img = Image.new("RGB", (400, 300), color="lightblue")
            draw = ImageDraw.Draw(img)
            draw.text((100, 150), "Sample Image", fill="black")
            img.save(sample, "JPEG")
        except ImportError:
            sample.write_bytes(b"fake image data")
    return sample

# 原图下载
@app.get("/download/image/{name}")
def download_image(name: str):
    file_path = IMAGES_DIR / name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="图片不存在")
    return FileResponse(
        path=str(file_path),
        media_type="image/jpeg",
        filename=name,
    )

# 图片预览（内联显示）
@app.get("/preview/image/{name}")
def preview_image(name: str):
    file_path = IMAGES_DIR / name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="图片不存在")
    return FileResponse(
        path=str(file_path),
        media_type="image/jpeg",
    )

# 动态缩略图（用 Pillow 实时生成）
@app.get("/thumbnail/{name}")
def thumbnail(name: str, size: int = Query(128, ge=32, le=512)):
    file_path = IMAGES_DIR / name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="图片不存在")
    try:
        from PIL import Image
    except ImportError:
        raise HTTPException(status_code=500, detail="服务器未安装 Pillow")
    img = Image.open(file_path)
    img.thumbnail((size, size))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    buf.seek(0)
    return StreamingResponse(
        content=iter([buf.getvalue()]),
        media_type="image/jpeg",
        headers={"Cache-Control": "public, max-age=86400"},
    )

@app.on_event("startup")
def startup():
    ensure_sample_image()
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

### 10.2 错误处理

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

### 10.3 客户端断开检测

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

## 十一、常见错误（新手避坑）

### 错误 1：大文件用 read() 一次性读进内存

\`\`\`python
# ❌ 错误：1GB 文件全部读进内存，并发几个就 OOM
@app.get("/download/{filename}")
def download(filename: str):
    with open(filename, "rb") as f:
        data = f.read()  # 全部读进内存！
    return Response(content=data)

# ✅ 正确：用生成器分块读取
def file_iterator(file_path, chunk_size=64*1024):
    with open(file_path, "rb") as f:
        while chunk := f.read(chunk_size):
            yield chunk

@app.get("/download/{filename}")
def download(filename: str):
    return StreamingResponse(file_iterator(filename))
\`\`\`

### 错误 2：流式响应里忘了关闭文件

\`\`\`python
# ❌ 错误：没用 with，文件可能不会关闭
def bad_iterator(file_path):
    f = open(file_path, "rb")  # 没用 with！
    while True:
        chunk = f.read(8192)
        if not chunk:
            break
        yield chunk
    # 如果生成器中途异常，f.close() 不会被调用

# ✅ 正确：用 with 确保文件关闭
def good_iterator(file_path):
    with open(file_path, "rb") as f:  # with 确保异常时也关闭
        while True:
            chunk = f.read(8192)
            if not chunk:
                break
            yield chunk
\`\`\`

### 错误 3：路径没校验，导致目录穿越

\`\`\`python
# ❌ 错误：filename 直接拼接，能读到系统文件
@app.get("/download/{filename}")
def download(filename: str):
    file_path = "files/" + filename  # filename="../../etc/passwd" 能读系统文件！
    return FileResponse(file_path)

# ✅ 正确：用 resolve + relative_to 校验
from pathlib import Path
file_path = (Path("files") / filename).resolve()
file_path.relative_to(Path("files").resolve())  # 不在范围内会抛异常
\`\`\`

### 错误 4：SSE 没设正确的 media_type

\`\`\`python
# ❌ 错误：media_type 设成 text/plain，浏览器不识别为 SSE
return StreamingResponse(content=gen(), media_type="text/plain")

# ✅ 正确：SSE 必须用 text/event-stream
return StreamingResponse(content=gen(), media_type="text/event-stream")
\`\`\`

## 十二、动手实验

### 实验 1：实现一个流式时间接口

要求：每秒推送一次当前时间，持续 10 次。

提示：
\`\`\`python
# 参考代码框架
def time_generator():
    for i in range(10):
        from datetime import datetime
        yield f"当前时间: {datetime.now()}\\n".encode("utf-8")
        time.sleep(1)

@app.get("/stream/time")
def stream_time():
    return StreamingResponse(content=time_generator(), media_type="text/plain")
\`\`\`

### 实验 2：实现大文件下载（带进度提示）

要求：用 \`StreamingResponse\` 实现大文件下载，设置 \`Content-Length\` 让浏览器显示进度条。

提示：用 \`os.path.getsize()\` 获取文件大小，设到响应头。

### 实验 3：实现 SSE 实时通知

要求：实现一个 SSE 接口，每 2 秒推送一条通知，前端用 \`EventSource\` 接收并显示。

提示：参考第八节 SSE 示例，\`media_type\` 必须是 \`text/event-stream\`。

## 十三、各类响应对比

FastAPI 提供了多种响应类，选错会导致内容类型不对、下载失败、SSE 不工作等问题。下面这张表是"选型速查表"。

### 13.1 响应类对比表

| 响应类 | Content-Type | 适用场景 | 是否流式 | 备注 |
|--------|--------------|----------|----------|------|
| \`JSONResponse\` | \`application/json\` | 返回 JSON 数据（默认） | 否 | FastAPI 默认响应类 |
| \`PlainTextResponse\` | \`text/plain; charset=utf-8\` | 返回纯文本、日志、配置 | 否 | 不解析 HTML 标签 |
| \`HTMLResponse\` | \`text/html; charset=utf-8\` | 返回 HTML 页面、片段 | 否 | 浏览器会渲染标签 |
| \`RedirectResponse\` | \`text/html; charset=utf-8\` | 跳转 URL（301/302/307/308） | 否 | 设置 \`status_code\` 控制永久/临时 |
| \`StreamingResponse\` | 自定义（默认 \`application/json\`） | 大文件、日志流、SSE | 是 | 生成器逐块产出 |
| \`FileResponse\` | 根据文件扩展名自动推断 | 静态文件下载、图片、PDF | 是（ASGI 优化） | 支持 Range 请求 |
| \`Response\` | 自定义 | 自定义二进制、原始字节 | 否 | 最底层，完全手动 |

### 13.2 选型决策树

\`\`\`text
要返回什么？
├─ JSON 数据 → JSONResponse（默认，不用写）
├─ 纯文本/日志 → PlainTextResponse
├─ HTML 页面 → HTMLResponse
├─ 跳转 → RedirectResponse
├─ 文件
│   ├─ 静态文件（路径已知）→ FileResponse（性能最好）
│   └─ 动态生成（内存中拼）→ StreamingResponse
├─ 实时推送（SSE/日志流）→ StreamingResponse + text/event-stream
└─ 完全自定义 → Response
\`\`\`

### 13.3 一个接口演示所有响应类

\`\`\`python
from fastapi import FastAPI, Response
from fastapi.responses import (
    JSONResponse, PlainTextResponse, HTMLResponse,
    RedirectResponse, StreamingResponse, FileResponse
)
import json

app = FastAPI()

# 1. JSON（默认）
@app.get("/resp/json")
def resp_json():
    # 直接返回 dict，FastAPI 自动转 JSONResponse
    return {"msg": "hello", "code": 0}

# 2. 纯文本
@app.get("/resp/text", response_class=PlainTextResponse)
def resp_text():
    # response_class 指定响应类，return 字符串
    return "这是一段纯文本\\n换行也保留"

# 3. HTML
@app.get("/resp/html", response_class=HTMLResponse)
def resp_html():
    # 返回 HTML 字符串，浏览器会渲染
    return "<h1 style='color:red'>你好</h1><p>这是 HTML 响应</p>"

# 4. 重定向
@app.get("/resp/redirect")
def resp_redirect():
    # 307 保留请求方法（POST 重定向后还是 POST）
    # 302 会把 POST 改成 GET
    return RedirectResponse(url="/resp/json", status_code=307)

# 5. 流式
@app.get("/resp/stream")
def resp_stream():
    def gen():
        for i in range(3):
            yield f"第 {i} 块\\n"
    # text/plain 让浏览器直接显示，不下载
    return StreamingResponse(gen(), media_type="text/plain")

# 6. 自定义 Response（原始字节）
@app.get("/resp/raw")
def resp_raw():
    # 手动构造字节，设置 Content-Type
    data = b"\\x89PNG\\r\\n\\x1a\\n"  # 假装是 PNG 头
    return Response(content=data, media_type="image/png")
\`\`\`

### 13.4 response_class 的作用

\`\`\`python
# 路径函数返回 str，但用 response_class=PlainTextResponse
# FastAPI 才知道"这个字符串是纯文本，不是 JSON"
@app.get("/log", response_class=PlainTextResponse)
def get_log():
    return open("app.log").read()  # 直接返回日志全文
\`\`\`

如果不写 \`response_class=PlainTextResponse\`，FastAPI 会把字符串当 JSON 序列化（加引号、转义换行），返回 \`"日志内容\\n"\`，浏览器看到的是带引号的字符串，不是纯文本。

### 13.5 自定义默认响应类

\`\`\`python
from fastapi.responses import ORJSONResponse

# 全局换成 orjson（比标准 json 快 2-3 倍）
app = FastAPI(default_response_class=ORJSONResponse)

# 所有接口默认用 ORJSONResponse，不用每个都写
@app.get("/fast")
def fast_json():
    return {"msg": "用 orjson 序列化，更快"}
\`\`\`

需要先安装：\`pip install orjson\`。

## 十四、本章小结

### 14.1 核心知识点回顾

1. **为什么流式**：大文件防 OOM、实时推送降延迟、SSE/WebSocket 场景必需。
2. **StreamingResponse**：接收生成器（同步或异步），逐块产出。注意 \`media_type\` 决定浏览器行为（显示/下载/EventSource）。
3. **FileResponse**：专门下文件，ASGI 层优化，支持 Range 请求（断点续传）。比 \`StreamingResponse\` 读文件更高效。
4. **Content-Disposition**：\`attachment\` 触发下载，\`inline\` 浏览器内显示。中文文件名用 RFC 5987 编码（\`filename*=UTF-8''...\`）。
5. **SSE**：\`text/event-stream\` + \`data: ...\\n\\n\` 格式，前端用 \`EventSource\` 接收。比 WebSocket 简单，适合单向推送。
6. **Range 请求**：\`Range: bytes=0-99\` → 206 Partial Content + \`Content-Range\`，支持断点续传。
7. **路径安全**：用 \`Path.resolve().relative_to(base_dir)\` 防目录穿越攻击。

### 14.2 生活类比总结

- **流式响应像水龙头**：开闸就流，不等水塔蓄满。StreamingResponse 就是"边生成边流"。
- **FileResponse 像快递寄整箱**：东西已经在仓库（磁盘）里，直接让快递（ASGI）去取，不用你（Python）搬。
- **Content-Disposition 像快递签收方式**：\`attachment\` 是"必须签收（下载）"，\`inline\` 是"放门口就行（浏览器显示）"。
- **SSE 像广播电台**：服务器一直发，客户端只听不说。要双向通话用 WebSocket。
- **Range 请求像翻书**：不用整本搬来，翻到第 100 页读一段就行。

### 14.3 选型决策一句话

| 需求 | 一句话选型 |
|------|-----------|
| 返回 JSON | 默认（JSONResponse） |
| 返回文本/日志 | \`response_class=PlainTextResponse\` |
| 大文件下载 | \`FileResponse\`（优先）或 \`StreamingResponse\` |
| 实时日志/通知 | \`StreamingResponse\` + \`text/event-stream\` |
| 动态生成 CSV/Excel | \`StreamingResponse\` + 生成器 |
| 断点续传 | \`FileResponse\`（自动支持）或手动实现 206 |
| 跳转 | \`RedirectResponse\` |

### 14.4 性能对比速记

- \`FileResponse\` > \`StreamingResponse\` 手动读文件（ASGI 层更高效）
- 异步生成器 > 同步生成器（不阻塞事件循环，但同步生成器 FastAPI 会用线程池兜底）
- \`orjson\` > 标准 \`json\`（序列化快 2-3 倍）
- SSE < WebSocket（SSE 单向、开销小；WebSocket 双向、开销大）

### 14.5 下章预告

下一章我们将学习 **FastAPI 的依赖注入进阶**：\`yield\` 依赖、依赖覆盖（测试用）、全局依赖、类作为依赖等。依赖注入是 FastAPI 的灵魂，掌握它才能写出可测试、可复用的生产级代码。
`
  }
];
