// =============================================================
// FastAPI 应用开发实战教程 - 第 3 批章节（请求体与表单 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-body  : 请求体 Pydantic Model
//   fa-form  : 表单数据 Form
//   fa-upload: 文件上传 UploadFile
//   fa-field : Body 字段与 Field
// ============================================================

export const chapters = [
  // ============================================================
  // 第 9 章：请求体 Pydantic Model
  // ============================================================
  {
    id: "fa-body",
    group: "请求体与表单",
    icon: "📦",
    title: "请求体 Pydantic Model",
    content: `# 请求体 Pydantic Model

## 什么是请求体（HTTP Body）

HTTP 请求由三部分组成：**请求行**（method + URL + 版本）、**请求头**（headers）、**请求体**（body）。其中请求体是请求中真正"装载数据"的部分，常用于 POST、PUT、PATCH 等需要向服务器提交数据的场景。

GET 请求一般没有 body（参数走 URL query string），而 POST 创建资源时通常把数据放在 body 里。请求体的格式由请求头 \`Content-Type\` 决定，常见的有：

- \`application/json\` —— JSON 格式，现代 API 最常用
- \`application/x-www-form-urlencoded\` —— 传统 HTML 表单
- \`multipart/form-data\` —— 文件上传表单
- \`application/xml\` —— XML 格式（少见）
- \`text/plain\` —— 纯文本（少见）

FastAPI 最擅长处理的是 **JSON body**。你只需要用 Pydantic 的 \`BaseModel\` 定义数据结构，FastAPI 就会自动完成：解析 JSON、类型转换、数据校验、生成 OpenAPI 文档、生成交互式 API 调试页面。这是 FastAPI 最核心的能力之一。

## Pydantic BaseModel 定义

要接收 JSON 请求体，第一步是定义一个 Pydantic 模型。模型是一个继承 \`BaseModel\` 的类，类的属性就是 JSON 的字段。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 Pydantic 数据模型 UserCreate，继承 BaseModel
class UserCreate(BaseModel):
    # 字段 username，类型: str，无默认值 → 必填
    username: str
    # 字段 email，类型: str，无默认值 → 必填
    email: str
    # 字段 age，类型: int | None，默认值: None → 可选
    age: int | None = None
    # 字段 is_active，类型: bool，默认值: True → 可选
    is_active: bool = True

# 定义 POST 路由：访问 /users 时触发
@app.post("/users")
# 定义函数 create_user，参数: user: UserCreate
def create_user(user: UserCreate):
    # user 是 UserCreate 实例，字段已经过自动校验
    # 可以直接用点号访问属性：user.username、user.email
    # 返回字典
    return {
        # "username": user.username,
        "username": user.username,
        # "email": user.email,
        "email": user.email,
        # "age": user.age,
        "age": user.age,
        # "is_active": user.is_active
        "is_active": user.is_active
    }
\`\`\`

**发生了什么：**

1. FastAPI 看到 \`user: UserCreate\` 参数，类型是 \`BaseModel\` 子类，识别为请求体。
2. 读取请求 body，解析 JSON。
3. 用解析的数据实例化 \`UserCreate\`，做类型校验。
4. 校验失败返回 422 + 错误详情；成功则把实例传给 \`user\` 参数。

请求示例：

\`\`\`bash
# 用 curl 发送 POST 请求
curl -X POST http://localhost:8000/users \\
  -H "Content-Type: application/json" \\
  -d '{"username": "alice", "email": "a@x.com", "age": 30}'
\`\`\`

返回：

\`\`\`json
{"username": "alice", "email": "a@x.com", "age": 30, "is_active": true}
\`\`\`

## 声明请求体参数

### 单个请求体参数

最常见的情况：函数有一个 \`BaseModel\` 类型的参数，FastAPI 把整个 JSON body 解析成这个模型。

\`\`\`python
# 定义 Pydantic 数据模型 Item，继承 BaseModel
class Item(BaseModel):
    # 字段 name，类型: str
    name: str
    # 字段 price，类型: float
    price: float

# 定义 POST 路由：访问 /items 时触发
@app.post("/items")
# 定义函数 create_item，参数: item: Item
def create_item(item: Item):
    # item 是 Item 实例，直接返回它
    # Pydantic 模型可以被 FastAPI 自动序列化为 JSON
    return item
\`\`\`

### 多个请求体参数

FastAPI 支持在同一个函数里声明多个 \`BaseModel\` 参数。此时 body 是一个 JSON 对象，每个模型参数是它的一个 key（key 名 = 参数名）。

\`\`\`python
# 定义 Pydantic 数据模型 Item，继承 BaseModel
class Item(BaseModel):
    # 字段 name，类型: str
    name: str
    # 字段 price，类型: float
    price: float

# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # 字段 username，类型: str
    username: str

# 定义 POST 路由：访问 /order 时触发
@app.post("/order")
# 定义函数 create_order，参数: item: Item, user: User
def create_order(item: Item, user: User):
    # 期望的 body 格式：
    # {
    #   "item": {"name": "phone", "price": 1999},
    #   "user": {"username": "alice"}
    # }
    # 返回字典
    return {
        # "item": item,
        "item": item,
        # "user": user
        "user": user
    }
\`\`\`

### Demo 1：图书创建 API

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 Pydantic 数据模型 Book，继承 BaseModel
class Book(BaseModel):
    # 字段 title，类型: str，必填
    title: str
    # 字段 author，类型: str，必填
    author: str
    # 字段 pages，类型: int，必填
    pages: int
    # 字段 price，类型: float，必填
    price: float
    # 字段 tags，类型: list[str]，默认值: 空列表 → 可选
    tags: list[str] = []

# 模拟数据库，用列表存储
books_db = []

# 定义 POST 路由：访问 /books 时触发
@app.post("/books")
# 定义函数 create_book，参数: book: Book
def create_book(book: Book):
    # 把 book 转成字典存入数据库
    # book.model_dump() 是 Pydantic v2 的方法，返回 dict
    # v1 用 book.dict()，v2 改名为 model_dump()，语义更清晰
    # 返回的字典包含所有字段的值，如 {"title": "...", "author": "...", ...}
    # 不能直接存 BaseModel 实例到列表，因为后续 list_books 返回时
    # FastAPI 需要序列化，存 dict 更直观
    books_db.append(book.model_dump())
    # 返回创建结果
    return {
        # "message": "图书创建成功",
        "message": "图书创建成功",
        # "book": book
        "book": book
    }

# 定义 GET 路由：访问 /books 时触发，查询所有图书
@app.get("/books")
# 定义函数 list_books
def list_books():
    # 返回所有图书
    return books_db
\`\`\`

## 嵌套模型

模型字段可以是另一个模型，形成嵌套结构。这是处理复杂 JSON 的关键能力。

\`\`\`python
# 定义 Pydantic 数据模型 Address，继承 BaseModel
class Address(BaseModel):
    # 字段 city，类型: str
    city: str
    # 字段 street，类型: str
    street: str
    # 字段 zip_code，类型: str
    zip_code: str

# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # 字段 username，类型: str
    username: str
    # 字段 address，类型: Address → 嵌套模型
    address: Address
    # 字段 addresses，类型: list[Address] → 嵌套模型列表
    addresses: list[Address] = []
\`\`\`

对应的 JSON 结构：

\`\`\`json
{
  "username": "alice",
  "address": {
    "city": "北京",
    "street": "长安街1号",
    "zip_code": "100000"
  },
  "addresses": [
    {"city": "北京", "street": "...", "zip_code": "..."},
    {"city": "上海", "street": "...", "zip_code": "..."}
  ]
}
\`\`\`

### Demo 2：订单 API（含嵌套模型）

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 Pydantic 数据模型 OrderItem，继承 BaseModel
class OrderItem(BaseModel):
    # 字段 product_id，类型: int
    product_id: int
    # 字段 name，类型: str
    name: str
    # 字段 quantity，类型: int
    quantity: int
    # 字段 unit_price，类型: float
    unit_price: float

# 定义 Pydantic 数据模型 ShippingAddress，继承 BaseModel
class ShippingAddress(BaseModel):
    # 字段 recipient，类型: str → 收件人
    recipient: str
    # 字段 phone，类型: str
    phone: str
    # 字段 address，类型: str → 详细地址
    address: str

# 定义 Pydantic 数据模型 Order，继承 BaseModel
class Order(BaseModel):
    # 字段 order_id，类型: str
    order_id: str
    # 字段 items，类型: list[OrderItem] → 嵌套模型列表
    items: list[OrderItem]
    # 字段 shipping，类型: ShippingAddress → 嵌套模型
    shipping: ShippingAddress
    # 字段 remark，类型: str | None，默认值: None → 可选
    remark: str | None = None

# 定义 POST 路由：访问 /orders 时触发
@app.post("/orders")
# 定义函数 create_order，参数: order: Order
def create_order(order: Order):
    # 计算订单总金额
    # 遍历 items，每项的 quantity * unit_price 求和
    # sum() 是内置函数，对可迭代对象求和
    # 这里的语法是生成器表达式：item.quantity * item.unit_price for item in order.items
    # 等价于：
    #   total = 0
    #   for item in order.items:
    #       total += item.quantity * item.unit_price
    # 但生成器表达式更简洁，且是惰性求值（不生成中间列表）
    total = sum(item.quantity * item.unit_price for item in order.items)
    # 返回订单详情
    return {
        # "order_id": order.order_id,
        "order_id": order.order_id,
        # "item_count": len(order.items),
        "item_count": len(order.items),
        # "total": total,
        "total": total,
        # "recipient": order.shipping.recipient → 访问嵌套字段
        "recipient": order.shipping.recipient,
        # "remark": order.remark
        "remark": order.remark
    }
\`\`\`

## 请求体 + 路径参数 + 查询参数混用

一个函数可以同时有路径参数、查询参数和请求体参数。FastAPI 按以下规则区分：

- **路径参数**：在路由路径里声明了（如 \`{item_id}\`）
- **查询参数**：基本类型（int、str、bool 等）且不在路径里
- **请求体**：\`BaseModel\` 类型

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 Pydantic 数据模型 Item，继承 BaseModel
class Item(BaseModel):
    # 字段 name，类型: str
    name: str
    # 字段 price，类型: float
    price: float

# 定义 PUT 路由：访问 /items/{item_id} 时触发
@app.put("/items/{item_id}")
# 定义函数 update_item
# 参数: item_id: int（路径参数）
#       item: Item（请求体，因为是 BaseModel）
#       q: str | None = None（查询参数，因为基本类型 + 有默认值 + 不在路径里）
def update_item(item_id: int, item: Item, q: str | None = None):
    # 构造结果字典
    result = {
        # "item_id": item_id,
        "item_id": item_id,
        # "item": item
        "item": item
    }
    # 如果有查询参数 q，加入结果
    if q:
        # 把 q 加入结果
        result["q"] = q
    # 返回结果
    return result
\`\`\`

请求示例：

\`\`\`bash
# PUT 请求，路径参数 item_id=5，查询参数 q=hello，body 是 JSON
curl -X PUT "http://localhost:8000/items/5?q=hello" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "phone", "price": 1999}'
\`\`\`

## Optional 字段和默认值

### 必填 vs 可选规则

- **无默认值** → 必填字段
- **有默认值** → 可选字段（不传时用默认值）
- **类型含 None + 默认 None** → 可选且可为 null

\`\`\`python
# 定义 Pydantic 数据模型 UserCreate，继承 BaseModel
class UserCreate(BaseModel):
    # 必填字段：无默认值
    username: str
    email: str
    # 可选字段：有默认值
    age: int | None = None    # 可选，可为 null
    bio: str = ""             # 可选，默认空字符串
    is_admin: bool = False    # 可选，默认 False
    tags: list[str] = []      # 可选，默认空列表
\`\`\`

### 注意可变默认值

Pydantic 会安全地处理可变默认值（如 list、dict），不会像普通 Python 那样共享引用。但如果你需要每次创建实例时生成新的默认值，应该用 \`Field(default_factory=...)\`（下一章讲）。

### Demo 3：文章创建 API（含可选字段）

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 Pydantic 数据模型 ArticleCreate，继承 BaseModel
class ArticleCreate(BaseModel):
    # 字段 title，类型: str，必填
    title: str
    # 字段 content，类型: str，必填
    content: str
    # 字段 category，类型: str，默认值: "未分类" → 可选
    category: str = "未分类"
    # 字段 tags，类型: list[str]，默认值: 空列表 → 可选
    tags: list[str] = []
    # 字段 is_published，类型: bool，默认值: False → 可选
    is_published: bool = False
    # 字段 summary，类型: str | None，默认值: None → 可选
    summary: str | None = None

# 定义 POST 路由：访问 /articles 时触发
@app.post("/articles")
# 定义函数 create_article，参数: article: ArticleCreate
def create_article(article: ArticleCreate):
    # 如果没有 summary，自动生成
    if article.summary is None:
        # 取 content 前 50 个字符作为摘要
        article.summary = article.content[:50] + "..."
    # 如果已发布，加入发布时间标记
    if article.is_published:
        # 设置状态
        status = "已发布"
    else:
        # 草稿状态
        status = "草稿"
    # 返回创建结果
    return {
        # "title": article.title,
        "title": article.title,
        # "category": article.category,
        "category": article.category,
        # "tags": article.tags,
        "tags": article.tags,
        # "status": status,
        "status": status,
        # "summary": article.summary
        "summary": article.summary
    }
\`\`\`

## 请求体示例 example

FastAPI 自动生成的 OpenAPI 文档里，每个模型会显示一个示例。你可以通过 \`model_config\` 的 \`json_schema_extra\` 自定义这个示例。

### 方式一：model_config + json_schema_extra

\`\`\`python
# 从 pydantic 导入 BaseModel, ConfigDict
from pydantic import BaseModel, ConfigDict

# 定义 Pydantic 数据模型 UserCreate，继承 BaseModel
class UserCreate(BaseModel):
    # Pydantic v2 的模型配置写法
    model_config = ConfigDict(
        # json_schema_extra 定义 OpenAPI 文档中的示例
        json_schema_extra={
            # "examples": [示例对象]
            "examples": [
                {
                    # "username": "alice",
                    "username": "alice",
                    # "email": "alice@example.com",
                    "email": "alice@example.com",
                    # "age": 25
                    "age": 25
                }
            ]
        }
    )
    # 字段 username，类型: str
    username: str
    # 字段 email，类型: str
    email: str
    # 字段 age，类型: int | None，默认值: None
    age: int | None = None
\`\`\`

### 方式二：使用 Field 的 example 参数

\`\`\`python
# 从 pydantic 导入 BaseModel, Field
from pydantic import BaseModel, Field

# 定义 Pydantic 数据模型 Item，继承 BaseModel
class Item(BaseModel):
    # 用 Field 给每个字段加示例
    # Field(..., example="手机") 第一个 ... 表示必填
    name: str = Field(..., example="手机")
    # price 字段，示例 1999.0
    price: float = Field(..., example=1999.0)
    # tags 字段，示例 ["电子", "数码"]
    tags: list[str] = Field(default=[], example=["电子", "数码"])
\`\`\`

### Demo 4：带示例的商品模型

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel, Field
from pydantic import BaseModel, Field

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 Pydantic 数据模型 Product，继承 BaseModel
class Product(BaseModel):
    # 字段 name，类型: str，示例: "MacBook Pro"
    name: str = Field(..., example="MacBook Pro")
    # 字段 price，类型: float，示例: 12999.0
    price: float = Field(..., example=12999.0)
    # 字段 stock，类型: int，示例: 100
    stock: int = Field(..., example=100)
    # 字段 description，类型: str | None，默认值: None，示例: "苹果笔记本"
    description: str | None = Field(None, example="苹果笔记本")
    # 字段 categories，类型: list[str]，默认值: 空列表，示例: ["电子", "电脑"]
    categories: list[str] = Field(default=[], example=["电子", "电脑"])

# 定义 POST 路由：访问 /products 时触发
@app.post("/products")
# 定义函数 create_product，参数: product: Product
def create_product(product: Product):
    # 计算库存价值
    value = product.price * product.stock
    # 返回创建结果
    return {
        # "product": product,
        "product": product,
        # "total_value": value
        "total_value": value
    }
\`\`\`

打开 \`http://localhost:8000/docs\`，你会看到 Swagger UI 里 \`/products\` 接口的请求体示例已经自动填好了。

## JSON 请求体格式详解

### 标准 JSON body

最常见格式：整个 body 就是一个 JSON 对象，对应一个 BaseModel。

\`\`\`json
{
  "username": "alice",
  "email": "alice@example.com",
  "age": 25
}
\`\`\`

### 嵌套 JSON body

body 里有嵌套对象或数组。

\`\`\`json
{
  "username": "alice",
  "address": {
    "city": "北京",
    "street": "长安街"
  },
  "orders": [
    {"id": 1, "total": 99.5},
    {"id": 2, "total": 199.0}
  ]
}
\`\`\`

### 多模型 body 的 JSON 格式

当函数声明多个 BaseModel 参数时，body 的每个模型是一个 key：

\`\`\`json
{
  "item": {"name": "phone", "price": 1999},
  "user": {"username": "alice"}
}
\`\`\`

### 数组 body

body 也可以是 JSON 数组，对应 \`list[Model]\`：

\`\`\`python
# 定义 POST 路由：访问 /items/batch 时触发
@app.post("/items/batch")
# 定义函数 create_items，参数: items: list[Item]
def create_items(items: list[Item]):
    # items 是 Item 实例列表
    # 返回创建数量
    return {"created": len(items)}
\`\`\`

body 格式：

\`\`\`json
[
  {"name": "phone", "price": 1999},
  {"name": "book", "price": 39.9}
]
\`\`\`

### 字段别名（alias）

有时 JSON 里的字段名和 Python 属性名不一致（比如 JSON 用驼峰，Python 用蛇形）。可以用 \`Field(alias=...)\` 或 \`AliasGenerator\`。

\`\`\`python
# 从 pydantic 导入 BaseModel, Field, ConfigDict
from pydantic import BaseModel, Field, ConfigDict

# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # 允许按字段名或别名填充
    model_config = ConfigDict(populate_by_name=True)
    # 字段 user_name，别名: "userName"（JSON 里用驼峰）
    user_name: str = Field(alias="userName")
    # 字段 created_at，别名: "createdAt"
    created_at: str = Field(alias="createdAt")

# 提交 JSON：
# {"userName": "alice", "createdAt": "2024-01-01"}
# 会映射到 user.user_name 和 user.created_at
\`\`\`

## 自动类型转换与校验

Pydantic 会尝试做合理的类型转换（coercion），不是严格匹配：

\`\`\`python
# 定义 Pydantic 数据模型 Product，继承 BaseModel
class Product(BaseModel):
    # 字段 name，类型: str
    name: str
    # 字段 price，类型: float
    price: float
    # 字段 in_stock，类型: bool
    in_stock: bool

# 提交 {"name": "phone", "price": "199.5", "in_stock": "true"}
# Pydantic 把 "199.5" 转成 float 199.5
# 把 "true" 转成 bool True
# 这是宽松模式（默认），不是严格模式
\`\`\`

但传不能转换的值会报 422：

- \`price: "abc"\` → 422（字符串转不了 float）
- \`in_stock: "maybe"\` → 422（转不了 bool）
- \`price: null\` 且无默认值 → 422（null 不是 float）

### 校验错误响应格式

\`\`\`json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "email"],
      "msg": "Field required",
      "input": {"username": "alice"}
    }
  ]
}
\`\`\`

- \`type\`：错误类型（missing、value_error、type_error 等）
- \`loc\`：错误位置（body 里的哪个字段）
- \`msg\`：人类可读的错误消息
- \`input\`：触发错误的输入值

## 实战：用户注册 API

### Demo 5：完整的用户注册 API

\`\`\`python
# 从 fastapi 导入 FastAPI, HTTPException
from fastapi import FastAPI, HTTPException
# 从 pydantic 导入 BaseModel, Field
from pydantic import BaseModel, Field

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 Pydantic 数据模型 UserRegister，继承 BaseModel
class UserRegister(BaseModel):
    # 字段 username，类型: str，示例: "alice"
    username: str = Field(..., example="alice")
    # 字段 email，类型: str，示例: "alice@example.com"
    email: str = Field(..., example="alice@example.com")
    # 字段 password，类型: str，示例: "123456"
    password: str = Field(..., example="123456")
    # 字段 age，类型: int | None，默认值: None，示例: 25
    age: int | None = Field(None, example=25)
    # 字段 gender，类型: str，默认值: "secret"，示例: "female"
    gender: str = Field("secret", example="female")

# 定义 Pydantic 数据模型 UserResponse，继承 BaseModel
class UserResponse(BaseModel):
    # 字段 id，类型: int
    id: int
    # 字段 username，类型: str
    username: str
    # 字段 email，类型: str
    email: str
    # 字段 age，类型: int | None
    age: int | None
    # 字段 gender，类型: str
    gender: str
    # 注意：不包含 password，安全考虑

# 模拟数据库，用字典存储
users_db = {}
# 自增 ID 计数器
next_id = 1

# 定义 POST 路由：访问 /register 时触发
# response_model=UserResponse 指定响应结构为 UserResponse
# FastAPI 会按 UserResponse 的字段过滤返回值
# 这里关键是过滤掉 password 字段（UserResponse 里没有 password）
@app.post("/register", response_model=UserResponse)
# 定义函数 register，参数: user: UserRegister
def register(user: UserRegister):
    # 声明 next_id 为全局变量
    # 因为函数内要修改 next_id（next_id += 1）
    # 不加 global 会创建局部变量，无法修改全局的 next_id
    global next_id
    # 检查用户名是否已存在
    for existing in users_db.values():
        # 如果用户名已存在
        if existing["username"] == user.username:
            # 抛出 400 错误
            raise HTTPException(status_code=400, detail="用户名已存在")
    # 检查邮箱是否已存在
    for existing in users_db.values():
        # 如果邮箱已存在
        if existing["email"] == user.email:
            # 抛出 400 错误
            raise HTTPException(status_code=400, detail="邮箱已被注册")
    # 创建用户记录（不存明文密码，实际项目要 hash）
    user_record = {
        # "id": next_id,
        "id": next_id,
        # "username": user.username,
        "username": user.username,
        # "email": user.email,
        "email": user.email,
        # "age": user.age,
        "age": user.age,
        # "gender": user.gender
        "gender": user.gender
    }
    # 存入数据库
    users_db[next_id] = user_record
    # ID 自增
    next_id += 1
    # 返回用户记录（FastAPI 会按 response_model 过滤字段）
    return user_record

# 定义 GET 路由：访问 /users/{user_id} 时触发
@app.get("/users/{user_id}", response_model=UserResponse)
# 定义函数 get_user，参数: user_id: int
def get_user(user_id: int):
    # 如果用户不存在
    if user_id not in users_db:
        # 抛出 404 错误
        raise HTTPException(status_code=404, detail="用户不存在")
    # 返回用户记录
    return users_db[user_id]
\`\`\`

**要点总结：**

1. \`BaseModel\` 定义请求体结构，自动解析 JSON + 校验类型。
2. 字段无默认值 = 必填，有默认值 = 可选。
3. 模型可嵌套，对应嵌套 JSON。
4. 路径参数、查询参数、请求体可混用，FastAPI 自动区分。
5. \`Field(..., example=...)\` 或 \`json_schema_extra\` 可定义文档示例。
6. \`response_model\` 可控制响应结构，过滤敏感字段。
7. 校验失败自动返回 422，无需手写校验代码。
`,
  },

  // ============================================================
  // 第 10 章：表单数据 Form
  // ============================================================
  {
    id: "fa-form",
    group: "请求体与表单",
    icon: "📝",
    title: "表单数据 Form",
    content: `# 表单数据 Form

## Form 与 JSON 的区别

在前端和后端通信时，数据可以通过多种方式发送。最常见的是 JSON 和表单（Form）两种。

**JSON 请求体：**
- \`Content-Type: application/json\`
- body 是 JSON 字符串
- 支持嵌套结构、数组、复杂类型
- 现代 API 首选

**表单数据：**
- \`Content-Type: application/x-www-form-urlencoded\` 或 \`multipart/form-data\`
- body 是键值对（key=value&key=value）
- 结构扁平，只有字符串
- 传统 HTML 表单的默认格式

FastAPI 默认用 JSON。当需要接收表单数据时，要用 \`Form()\` 声明参数。

**什么时候用表单？**

- 处理传统 HTML \`<form>\` 提交（前端没改 JSON）
- 浏览器原生表单场景
- 需要和文件一起上传的简单字段
- 对接老系统

## application/x-www-form-urlencoded

这是表单最常见格式。数据编码成 \`key=value&key=value\`，特殊字符做 URL 编码。

\`\`\`
# 请求体示例
username=alice&password=123456&age=25
\`\`\`

请求头：

\`\`\`
Content-Type: application/x-www-form-urlencoded
\`\`\`

特点：
- 简单键值对，值都是字符串
- 不支持嵌套结构（只能靠命名约定，如 \`user[name]\`）
- 不支持直接传文件（文件要用 multipart）
- 体积小，适合少量文本数据

## multipart/form-data

当表单包含文件上传时，必须用 \`multipart/form-data\`。它把每个字段用"边界"分隔，每个部分可以有自己的 \`Content-Type\`。

\`\`\`
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="username"

alice
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="avatar"; filename="photo.jpg"
Content-Type: image/jpeg

（二进制数据）
------WebKitFormBoundary7MA4YWxkTrZu0gW--
\`\`\`

特点：
- 支持文本和二进制（文件）混合
- 每个字段可以指定 Content-Type
- 体积比 urlencoded 稍大（多了边界和头）
- 文件上传必须用这个

在 FastAPI 里，只要用了 \`File()\` 或 \`UploadFile\`，就会自动用 \`multipart/form-data\`。

## Form() 基本用法

\`\`\`python
# 从 fastapi 导入 FastAPI, Form
from fastapi import FastAPI, Form

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /login 时触发
@app.post("/login")
# 定义函数 login
# 参数: username: str = Form(...)（表单字段，必填）
#       password: str = Form(...)（表单字段，必填）
def login(username: str = Form(...), password: str = Form(...)):
    # username 和 password 从表单 body 提取
    # 返回字典
    return {
        # "username": username,
        "username": username,
        # "password": password
        "password": password
    }
\`\`\`

注意：\`Form(...)\` 里的 \`...\` 表示必填。和查询参数不同，表单参数不能用普通的 \`username: str\` 声明，必须用 \`Form()\`。

请求示例：

\`\`\`bash
curl -X POST http://localhost:8000/login \\
  -d "username=alice" \\
  -d "password=123456"
\`\`\`

注意这里没有 \`-H "Content-Type: application/json"\`，curl 的 \`-d\` 默认用 \`application/x-www-form-urlencoded\`。

### Form() 和默认值

\`\`\`python
# 定义 POST 路由：访问 /feedback 时触发
@app.post("/feedback")
# 定义函数 submit_feedback
def submit_feedback(
    # name 是必填表单字段
    name: str = Form(...),
    # rating 必填，且会被转成 int
    rating: int = Form(...),
    # comment 可选，默认空字符串
    comment: str = Form(""),
    # contact 可选，默认 None
    contact: str | None = Form(None)
):
    # 返回字典
    return {
        # "name": name,
        "name": name,
        # "rating": rating,
        "rating": rating,
        # "comment": comment,
        "comment": comment,
        # "contact": contact
        "contact": contact
    }
\`\`\`

## 表单字段校验

\`Form()\` 支持和 \`Query()\`、\`Path()\` 一样的校验参数：

- \`min_length\` / \`max_length\`：字符串长度
- \`pattern\`（旧名 \`regex\`）：正则匹配
- \`ge\` / \`gt\` / \`le\` / \`lt\`：数值范围
- \`title\` / \`description\`：文档描述
- \`example\`：示例值

### Demo 1：带校验的注册表单

\`\`\`python
# 从 fastapi 导入 FastAPI, Form
from fastapi import FastAPI, Form

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /register 时触发
@app.post("/register")
# 定义函数 register
def register(
    # username: 3-20 字符
    username: str = Form(..., min_length=3, max_length=20, example="alice"),
    # password: 至少 6 字符
    password: str = Form(..., min_length=6, example="123456"),
    # email: 正则匹配邮箱格式
    email: str = Form(..., pattern=r"^[\\w.-]+@[\\w.-]+\\.\\w+$", example="a@b.com"),
    # age: 1-150 之间
    age: int = Form(..., ge=1, le=150, example=25),
    # phone: 可选，11 位数字
    phone: str | None = Form(None, pattern=r"^\\d{11}$", example="13800138000")
):
    # 返回注册结果
    return {
        # "username": username,
        "username": username,
        # "email": email,
        "email": email,
        # "age": age,
        "age": age,
        # "phone": phone
        "phone": phone,
        # "message": "注册成功"
        "message": "注册成功"
    }
\`\`\`

如果提交 \`username=ab\`（少于 3 字符），返回 422：

\`\`\`json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "username"],
      "msg": "String should have at least 3 characters",
      "input": "ab"
    }
  ]
}
\`\`\`

### Demo 2：搜索表单

\`\`\`python
# 从 fastapi 导入 FastAPI, Form
from fastapi import FastAPI, Form

# 创建 FastAPI 应用实例
app = FastAPI()

# 模拟商品数据
products = [
    {"id": 1, "name": "手机", "price": 1999, "category": "电子"},
    {"id": 2, "name": "笔记本", "price": 5999, "category": "电子"},
    {"id": 3, "name": "苹果", "price": 9.9, "category": "食品"},
    {"id": 4, "name": "椅子", "price": 299, "category": "家居"},
]

# 定义 POST 路由：访问 /search 时触发
@app.post("/search")
# 定义函数 search_products
def search_products(
    # keyword: 搜索关键词，必填
    keyword: str = Form(..., min_length=1, example="手机"),
    # category: 分类，可选
    category: str | None = Form(None, example="电子"),
    # min_price: 最低价，默认 0
    min_price: float = Form(0, ge=0, example=100),
    # max_price: 最高价，可选
    max_price: float | None = Form(None, ge=0, example=5000),
    # sort_by: 排序方式，默认 price
    sort_by: str = Form("price", pattern=r"^(price|name)$")
):
    # 过滤结果列表
    results = []
    # 遍历所有商品
    for p in products:
        # 检查关键词（name 里包含 keyword）
        if keyword not in p["name"]:
            continue
        # 检查分类
        if category and p["category"] != category:
            continue
        # 检查最低价
        if p["price"] < min_price:
            continue
        # 检查最高价
        if max_price and p["price"] > max_price:
            continue
        # 加入结果
        results.append(p)
    # 排序
    # sort_by 决定按什么排序
    # list.sort(key=...) 是原地排序，修改 results 本身
    # key=lambda x: x[sort_by] 是 lambda 函数：
    #   - lambda 是匿名函数，等价于 def f(x): return x[sort_by]
    #   - x 是列表里的每个元素（字典）
    #   - x[sort_by] 取排序字段（"price" 或 "name"）
    #   - sort 会根据 key 函数的返回值排序
    # 例如 sort_by="price" 时，按 x["price"] 的值升序排列
    results.sort(key=lambda x: x[sort_by])
    # 返回结果
    return {
        # "count": len(results),
        "count": len(results),
        # "results": results
        "results": results
    }
\`\`\`

## Form + Path + Query 混用

表单参数可以和路径参数、查询参数混用。规则和之前一样：

- 路径里的 \`{xxx}\` → 路径参数
- \`Form()\` 声明 → 表单字段
- 普通基本类型 → 查询参数

\`\`\`python
# 从 fastapi 导入 FastAPI, Form
from fastapi import FastAPI, Form

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 PUT 路由：访问 /users/{user_id}/profile 时触发
@app.put("/users/{user_id}/profile")
# 定义函数 update_profile
def update_profile(
    # user_id: 路径参数
    user_id: int,
    # name: 表单字段
    name: str = Form(...),
    # bio: 表单字段，可选
    bio: str | None = Form(None),
    # verbose: 查询参数（基本类型 + 不在路径 + 不是 Form）
    verbose: bool = False
):
    # 构造结果
    result = {
        # "user_id": user_id,
        "user_id": user_id,
        # "name": name,
        "name": name
    }
    # 如果有 bio
    if bio:
        # 加入结果
        result["bio"] = bio
    # 如果 verbose 模式
    if verbose:
        # 加入详情标记
        result["detail"] = True
    # 返回结果
    return result
\`\`\`

请求示例：

\`\`\`bash
curl -X PUT "http://localhost:8000/users/42/profile?verbose=true" \\
  -d "name=Alice" \\
  -d "bio=Hello"
\`\`\`

## 表单与文件同时上传

\`Form()\` 和 \`File()\` 可以在同一个函数里使用。此时自动用 \`multipart/form-data\`。

\`\`\`python
# 从 fastapi 导入 FastAPI, Form, File, UploadFile
from fastapi import FastAPI, Form, File, UploadFile

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /upload 时触发
@app.post("/upload")
# 定义函数 upload_file
def upload_file(
    # description: 表单文本字段
    description: str = Form(...),
    # category: 表单文本字段，可选
    category: str | None = Form(None),
    # file: 文件字段，用 UploadFile
    file: UploadFile = File(...)
):
    # 返回上传信息
    return {
        # "description": description,
        "description": description,
        # "category": category,
        "category": category,
        # "filename": file.filename,
        "filename": file.filename,
        # "content_type": file.content_type
        "content_type": file.content_type
    }
\`\`\`

请求示例：

\`\`\`bash
curl -X POST http://localhost:8000/upload \\
  -F "description=我的照片" \\
  -F "category=生活" \\
  -F "file=@photo.jpg"
\`\`\`

注意 \`-F\` 表示用 \`multipart/form-data\`，\`@photo.jpg\` 表示上传文件。

### Demo 3：简历投递 API（表单 + 文件）

\`\`\`python
# 从 fastapi 导入 FastAPI, Form, File, UploadFile, HTTPException
from fastapi import FastAPI, Form, File, UploadFile, HTTPException

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /apply 时触发
@app.post("/apply")
# 定义函数 submit_resume
def submit_resume(
    # name: 求职者姓名，必填
    name: str = Form(..., min_length=2, max_length=50),
    # email: 邮箱
    email: str = Form(..., pattern=r"^[\\w.-]+@[\\w.-]+\\.\\w+$"),
    # position: 应聘职位
    position: str = Form(..., min_length=2),
    # experience: 工作经验（年），0-50
    experience: int = Form(..., ge=0, le=50),
    # resume: 简历文件（PDF）
    resume: UploadFile = File(...)
):
    # 校验文件类型
    # resume.content_type 是客户端声明的 MIME 类型（可能被伪造，实际项目要校验魔数）
    if resume.content_type != "application/pdf":
        # 抛出 400 错误
        raise HTTPException(status_code=400, detail="简历必须是 PDF 格式")
    # 读取文件内容
    # resume.file 是底层文件对象（SpooledTemporaryFile）
    # read() 一次性读取全部内容到内存，返回 bytes
    # 适合小文件，大文件应该分块读取
    content = resume.file.read()
    # 校验文件大小（不超过 5MB）
    # 5 * 1024 * 1024 = 5MB（5 × 1024KB × 1024B）
    # 1MB = 1024 × 1024 字节 = 1048576 字节
    if len(content) > 5 * 1024 * 1024:
        # 抛出 400 错误
        raise HTTPException(status_code=400, detail="简历不能超过 5MB")
    # 返回投递成功信息
    return {
        # "name": name,
        "name": name,
        # "email": email,
        "email": email,
        # "position": position,
        "position": position,
        # "experience": experience,
        "experience": experience,
        # "resume_filename": resume.filename,
        "resume_filename": resume.filename,
        # "resume_size": len(content),
        "resume_size": len(content),
        # "message": "投递成功"
        "message": "投递成功"
    }
\`\`\`

## 表单的列表字段

表单可以传重复 key 来表示列表：

\`\`\`bash
curl -X POST http://localhost:8000/tags \\
  -d "tags=python" \\
  -d "tags=fastapi" \\
  -d "tags=web"
\`\`\`

\`\`\`python
# 从 fastapi 导入 FastAPI, Form
from fastapi import FastAPI, Form

# 创建 FastAPI 应用实例
app = FastAPI()

# 从 typing 导入 List
from typing import List

# 定义 POST 路由：访问 /tags 时触发
@app.post("/tags")
# 定义函数 add_tags
# 参数: tags: list[str] = Form(...)（表单列表字段）
def add_tags(tags: list[str] = Form(...)):
    # tags 是 ["python", "fastapi", "web"]
    # 返回字典
    return {
        # "tags": tags,
        "tags": tags,
        # "count": len(tags)
        "count": len(tags)
    }
\`\`\`

## Form 与 JSON 不能混用

**重要限制**：一个函数里不能同时用 \`Form()\` 和 \`BaseModel\`（JSON body）。因为它们的 \`Content-Type\` 不同。

错误示例：

\`\`\`python
# ❌ 这样不行！Form 和 BaseModel 不能混用
@app.post("/wrong")
def wrong(data: MyModel, name: str = Form(...)):
    pass
\`\`\`

如果需要同时处理 JSON 和表单，要么：
1. 全用表单（\`Form()\`）
2. 全用 JSON（\`BaseModel\`）
3. 用 \`Request\` 对象手动解析

## 实战：登录表单 API

### Demo 4：完整登录 API

\`\`\`python
# 从 fastapi 导入 FastAPI, Form, HTTPException
from fastapi import FastAPI, Form, HTTPException
# 从 datetime 导入 timedelta
from datetime import timedelta

# 创建 FastAPI 应用实例
app = FastAPI()

# 模拟用户数据库
users_db = {
    "alice": {
        "username": "alice",
        "password": "secret123",  # 实际项目要存 hash
        "role": "admin"
    },
    "bob": {
        "username": "bob",
        "password": "bob456",
        "role": "user"
    }
}

# 模拟 token 存储
tokens_db = {}

# 定义 POST 路由：访问 /login 时触发
@app.post("/login")
# 定义函数 login
def login(
    # username: 表单字段，3-20 字符
    username: str = Form(..., min_length=3, max_length=20),
    # password: 表单字段，至少 6 字符
    password: str = Form(..., min_length=6),
    # remember: 记住我（可选）
    remember: bool = Form(False)
):
    # 检查用户是否存在
    if username not in users_db:
        # 抛出 401 错误
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    # 取出用户记录
    user = users_db[username]
    # 检查密码
    if user["password"] != password:
        # 抛出 401 错误
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    # 生成简单 token（实际项目用 JWT）
    token = f"token-{username}-{id(user)}"
    # 存入 token 存储
    tokens_db[token] = username
    # 计算过期时间
    if remember:
        # 记住我：7 天
        expires = "7天"
    else:
        # 不记住：1 天
        expires = "1天"
    # 返回登录成功
    return {
        # "message": "登录成功",
        "message": "登录成功",
        # "token": token,
        "token": token,
        # "token_type": "bearer",
        "token_type": "bearer",
        # "expires_in": expires,
        "expires_in": expires,
        # "user": {
        "user": {
            # "username": user["username"],
            "username": user["username"],
            # "role": user["role"]
            "role": user["role"]
        }
    }

# 定义 POST 路由：访问 /logout 时触发
@app.post("/logout")
# 定义函数 logout
def logout(
    # token: 表单字段
    token: str = Form(...)
):
    # 检查 token 是否存在
    if token not in tokens_db:
        # 抛出 401 错误
        raise HTTPException(status_code=401, detail="无效的 token")
    # 删除 token
    del tokens_db[token]
    # 返回登出成功
    return {"message": "已登出"}
\`\`\`

### Demo 5：联系表单 API

\`\`\`python
# 从 fastapi 导入 FastAPI, Form, HTTPException
from fastapi import FastAPI, Form, HTTPException

# 创建 FastAPI 应用实例
app = FastAPI()

# 模拟存储
messages = []

# 定义 POST 路由：访问 /contact 时触发
@app.post("/contact")
# 定义函数 submit_contact
def submit_contact(
    # name: 姓名，2-50 字符
    name: str = Form(..., min_length=2, max_length=50, example="张三"),
    # email: 邮箱
    email: str = Form(..., pattern=r"^[\\w.-]+@[\\w.-]+\\.\\w+$", example="z@x.com"),
    # subject: 主题，5-100 字符
    subject: str = Form(..., min_length=5, max_length=100, example="咨询订单"),
    # message: 内容，至少 10 字符
    message: str = Form(..., min_length=10, example="我想咨询..."),
    # priority: 优先级，只能是 low/normal/high
    priority: str = Form("normal", pattern=r"^(low|normal|high)$")
):
    # 构造消息记录
    record = {
        # "id": len(messages) + 1,
        "id": len(messages) + 1,
        # "name": name,
        "name": name,
        # "email": email,
        "email": email,
        # "subject": subject,
        "subject": subject,
        # "message": message,
        "message": message,
        # "priority": priority
        "priority": priority
    }
    # 存入列表
    messages.append(record)
    # 返回提交成功
    return {
        # "message": "提交成功，我们会尽快回复",
        "message": "提交成功，我们会尽快回复",
        # "ticket_id": record["id"]
        "ticket_id": record["id"]
    }

# 定义 GET 路由：访问 /contact/{ticket_id} 时触发
@app.get("/contact/{ticket_id}")
# 定义函数 get_ticket
def get_ticket(ticket_id: int):
    # 遍历查找
    for msg in messages:
        # 找到对应 ID
        if msg["id"] == ticket_id:
            # 返回消息
            return msg
    # 没找到，抛出 404
    raise HTTPException(status_code=404, detail="工单不存在")
\`\`\`

**要点总结：**

1. \`Form()\` 用于接收表单数据，\`Content-Type\` 是 \`application/x-www-form-urlencoded\` 或 \`multipart/form-data\`。
2. 表单参数必须用 \`Form()\` 声明，不能用普通类型注解。
3. \`Form()\` 支持 \`min_length\`、\`max_length\`、\`pattern\`、\`ge\`/\`le\` 等校验。
4. \`Form()\` 可以和路径参数、查询参数混用，但不能和 JSON \`BaseModel\` 混用。
5. \`Form()\` + \`File()\` 可以同时接收文本和文件。
6. 表单列表通过重复 key 实现（\`-d "tags=a" -d "tags=b"\`）。
`,
  },

  // ============================================================
  // 第 11 章：文件上传 UploadFile
  // ============================================================
  {
    id: "fa-upload",
    group: "请求体与表单",
    icon: "📎",
    title: "文件上传 UploadFile",
    content: `# 文件上传 UploadFile

## File() 基本用法

FastAPI 提供两种方式接收文件上传：

1. \`File(...)\` —— 返回 \`bytes\`，适合小文件，整个文件读入内存
2. \`UploadFile\` —— 返回文件对象，适合大文件，有更多属性和方法

### 用 File() 接收小文件

\`\`\`python
# 从 fastapi 导入 FastAPI, File
from fastapi import FastAPI, File

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /upload-bytes 时触发
@app.post("/upload-bytes")
# 定义函数 upload_bytes
# 参数: file: bytes = File(...)（文件内容，bytes 类型）
def upload_bytes(file: bytes = File(...)):
    # file 是文件全部内容的 bytes
    # 返回文件大小
    return {
        # "file_size": len(file),
        "file_size": len(file),
        # "file_bytes": len(file)
        "file_bytes": len(file)
    }
\`\`\`

\`File(bytes)\` 的缺点：整个文件一次性读入内存。如果上传 1GB 文件，内存就占 1GB。所以只适合小文件。

### 用 UploadFile 接收文件

\`\`\`python
# 从 fastapi 导入 FastAPI, UploadFile, File
from fastapi import FastAPI, UploadFile, File

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /upload 时触发
@app.post("/upload")
# 定义函数 upload_file
# 参数: file: UploadFile = File(...)
def upload_file(file: UploadFile = File(...)):
    # file 是 UploadFile 对象
    # 返回文件信息
    return {
        # "filename": file.filename,
        "filename": file.filename,
        # "content_type": file.content_type,
        "content_type": file.content_type,
    }
\`\`\`

\`UploadFile\` 更推荐使用，因为：

- 文件存内存 buffer（2MB 上限），超出自动写临时文件（SpooledTemporaryFile）
- 不会一次性占满内存
- 有丰富的属性和方法
- 支持异步读取

## UploadFile 对象属性

\`UploadFile\` 有以下属性：

| 属性 | 类型 | 说明 |
|------|------|------|
| \`filename\` | \`str \| None\` | 客户端上传的文件名 |
| \`content_type\` | \`str \| None\` | 文件 MIME 类型（如 image/jpeg） |
| \`size\` | \`int\` | 文件大小（字节），Pydantic v2 / FastAPI 新版支持 |
| \`file\` | \`SpooledTemporaryFile\` | 底层文件对象（同步） |
| \`headers\` | \`Headers\` | 文件的 HTTP 头信息 |

\`\`\`python
# 从 fastapi 导入 FastAPI, UploadFile, File
from fastapi import FastAPI, UploadFile, File

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /file-info 时触发
@app.post("/file-info")
# 定义函数 file_info
def file_info(file: UploadFile = File(...)):
    # 返回文件的所有属性
    return {
        # "filename": file.filename, → 原始文件名
        "filename": file.filename,
        # "content_type": file.content_type, → MIME 类型
        "content_type": file.content_type,
        # "size": file.size, → 文件大小（字节）
        "size": file.size,
        # "headers": dict(file.headers), → 头信息
        "headers": dict(file.headers)
    }
\`\`\`

## 同步读取文件内容

在同步路由函数（\`def\` 而非 \`async def\`）里，用 \`file.file.read()\` 或 \`file.read()\` 读取内容。

### Demo 1：同步读取文件

\`\`\`python
# 从 fastapi 导入 FastAPI, UploadFile, File, HTTPException
from fastapi import FastAPI, UploadFile, File, HTTPException

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /upload-sync 时触发
@app.post("/upload-sync")
# 定义函数 upload_sync（同步函数用 def）
def upload_sync(file: UploadFile = File(...)):
    # 校验文件类型（只允许图片）
    allowed_types = ["image/jpeg", "image/png", "image/gif"]
    # 如果不是允许的类型
    if file.content_type not in allowed_types:
        # 抛出 400 错误
        raise HTTPException(status_code=400, detail="只允许上传 JPEG/PNG/GIF 图片")
    # 同步读取文件全部内容
    # file.file 是底层文件对象，read() 返回 bytes
    contents = file.file.read()
    # 返回文件信息
    return {
        # "filename": file.filename,
        "filename": file.filename,
        # "content_type": file.content_type,
        "content_type": file.content_type,
        # "size": len(contents)
        "size": len(contents)
    }
\`\`\`

## 异步读取文件内容

在异步路由函数（\`async def\`）里，用 \`await file.read()\` 读取内容。这是推荐方式。

\`\`\`python
# 从 fastapi 导入 FastAPI, UploadFile, File
from fastapi import FastAPI, UploadFile, File

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /upload-async 时触发
@app.post("/upload-async")
# 定义函数 upload_async（异步函数用 async def）
async def upload_async(file: UploadFile = File(...)):
    # 异步读取文件内容
    # await file.read() 返回 bytes
    contents = await file.read()
    # 返回文件信息
    return {
        # "filename": file.filename,
        "filename": file.filename,
        # "size": len(contents)
        "size": len(contents)
    }
\`\`\`

**注意**：在 \`async def\` 里不要用 \`file.file.read()\`（同步阻塞会卡住事件循环），用 \`await file.read()\`。反过来，在 \`def\` 里不要用 \`await\`。

## 大文件分块上传

对于大文件，不要一次 \`read()\` 全部内容，而是分块（chunk）读取，避免内存暴涨。

### Demo 2：分块读取并存储

\`\`\`python
# 从 fastapi 导入 FastAPI, UploadFile, File
from fastapi import FastAPI, UploadFile, File

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /upload-chunk 时触发
@app.post("/upload-chunk")
# 定义函数 upload_chunk（异步函数）
async def upload_chunk(file: UploadFile = File(...)):
    # 定义块大小：1MB
    # 1024 * 1024 = 1048576 字节 = 1MB
    # 分块大小影响内存占用和 I/O 效率：
    # - 太小（如 1KB）：I/O 次数多，效率低
    # - 太大（如 100MB）：内存占用高
    # 1MB 是常用的平衡值
    chunk_size = 1024 * 1024
    # 总大小计数
    total_size = 0
    # 循环分块读取
    # while True 无限循环，靠 break 退出
    while True:
        # 异步读取一块
        # file.read(chunk_size) 最多读 chunk_size 字节
        # 文件末尾时返回空 bytes（b""）
        chunk = await file.read(chunk_size)
        # 如果读到空，说明文件结束
        # b"" 是 falsy，not chunk 为 True
        if not chunk:
            break
        # 累加大小
        # len(chunk) 返回这块的字节数
        total_size += len(chunk)
        # 这里可以处理每一块（写磁盘、上传 OSS 等）
        # 示例只统计大小
    # 返回结果
    return {
        # "filename": file.filename,
        "filename": file.filename,
        # "total_size": total_size
        "total_size": total_size
    }
\`\`\`

### 用 file.write() 写入另一个 UploadFile

\`\`\`python
# 从 fastapi 导入 FastAPI, UploadFile, File
from fastapi import FastAPI, UploadFile, File

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /copy-file 时触发
@app.post("/copy-file")
# 定义函数 copy_file
async def copy_file(file: UploadFile = File(...)):
    # 创建一个新的 UploadFile
    # file.write() 可以写入数据
    # 这里演示把原文件内容写到一个新位置
    # 先读取全部
    contents = await file.read()
    # 重置文件指针到开头（如果需要再次读取）
    await file.seek(0)
    # 返回大小
    return {
        # "size": len(contents)
        "size": len(contents)
    }
\`\`\`

## 多文件上传

用 \`list[UploadFile]\` 接收多个文件。

### Demo 3：多文件上传

\`\`\`python
# 从 fastapi 导入 FastAPI, UploadFile, File
from fastapi import FastAPI, UploadFile, File

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /upload-multiple 时触发
@app.post("/upload-multiple")
# 定义函数 upload_multiple
# 参数: files: list[UploadFile] = File(...)
async def upload_multiple(files: list[UploadFile] = File(...)):
    # 结果列表
    results = []
    # 遍历每个文件
    for file in files:
        # 异步读取内容
        contents = await file.read()
        # 构造文件信息
        info = {
            # "filename": file.filename,
            "filename": file.filename,
            # "content_type": file.content_type,
            "content_type": file.content_type,
            # "size": len(contents)
            "size": len(contents)
        }
        # 加入结果
        results.append(info)
    # 返回所有文件信息
    return {
        # "count": len(results),
        "count": len(results),
        # "files": results
        "files": results
    }
\`\`\`

请求示例：

\`\`\`bash
curl -X POST http://localhost:8000/upload-multiple \\
  -F "files=@photo1.jpg" \\
  -F "files=@photo2.png" \\
  -F "files=@doc.pdf"
\`\`\`

注意：参数名 \`files\` 和 \`-F\` 里的 key 要一致。

## 文件类型和大小限制

### 手动校验

\`\`\`python
# 从 fastapi 导入 FastAPI, UploadFile, File, HTTPException
from fastapi import FastAPI, UploadFile, File, HTTPException

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /upload-checked 时触发
@app.post("/upload-checked")
# 定义函数 upload_checked
async def upload_checked(file: UploadFile = File(...)):
    # 允许的文件类型
    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"
    ]
    # 校验文件类型
    if file.content_type not in allowed_types:
        # 抛出 400 错误
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件类型: {file.content_type}，只允许图片"
        )
    # 校验文件扩展名
    allowed_extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    # 取文件名小写
    filename = file.filename.lower()
    # 检查扩展名
    if not any(filename.endswith(ext) for ext in allowed_extensions):
        # 抛出 400 错误
        raise HTTPException(status_code=400, detail="文件扩展名不允许")
    # 读取文件内容
    contents = await file.read()
    # 校验文件大小（不超过 10MB）
    max_size = 10 * 1024 * 1024
    if len(contents) > max_size:
        # 抛出 400 错误
        raise HTTPException(status_code=400, detail="文件不能超过 10MB")
    # 返回成功
    return {
        # "filename": file.filename,
        "filename": file.filename,
        # "size": len(contents),
        "size": len(contents),
        # "message": "上传成功"
        "message": "上传成功"
    }
\`\`\`

### 用 magic 校验真实文件类型

\`\`\`python
# 安装：pip install python-magic
# 导入 magic 库
import magic

# 定义函数 get_real_type
def get_real_type(contents: bytes) -> str:
    # 用 magic 检测文件真实类型（不只看 Content-Type 头）
    # magic.from_buffer 读取 bytes 前几字节判断类型
    mime = magic.from_buffer(contents, mime=True)
    # 返回 MIME 类型
    return mime
\`\`\`

## 文件存储到磁盘

### Demo 4：保存文件到磁盘

\`\`\`python
# 从 fastapi 导入 FastAPI, UploadFile, File, HTTPException
from fastapi import FastAPI, UploadFile, File, HTTPException
# 导入 os 模块（路径操作）
import os
# 导入 uuid 模块（生成唯一文件名）
import uuid
# 导入 shutil 模块（文件操作）
import shutil

# 创建 FastAPI 应用实例
app = FastAPI()

# 上传目录
UPLOAD_DIR = "uploads"
# 如果目录不存在，创建它
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 定义 POST 路由：访问 /upload-save 时触发
@app.post("/upload-save")
# 定义函数 upload_and_save
def upload_and_save(file: UploadFile = File(...)):
    # 校验文件类型（只允许图片）
    allowed_types = ["image/jpeg", "image/png", "image/gif"]
    if file.content_type not in allowed_types:
        # 抛出 400 错误
        raise HTTPException(status_code=400, detail="只允许上传图片")
    # 生成唯一文件名，防止重名覆盖
    # 取原始扩展名
    # os.path.splitext("photo.jpg") 返回 ("photo", ".jpg")
    # [1] 取第二部分，即扩展名（含点号）
    ext = os.path.splitext(file.filename)[1]
    # 生成 UUID + 扩展名
    # uuid.uuid4() 生成随机 UUID 对象
    # .hex 取 32 位十六进制字符串（无连字符），如 "550e8400e29b41d4a716446655440000"
    new_filename = f"{uuid.uuid4().hex}{ext}"
    # 拼接完整路径
    # os.path.join 会自动处理路径分隔符，跨平台兼容
    # 如 os.path.join("uploads", "abc123.jpg") → "uploads/abc123.jpg"
    file_path = os.path.join(UPLOAD_DIR, new_filename)
    # 用 shutil.copyfileobj 把文件内容写到磁盘
    # file.file 是源文件对象，目标文件用 open 创建
    # "wb" 表示以二进制写入模式打开（文件是二进制数据，必须用 wb 不能用 w）
    with open(file_path, "wb") as buffer:
        # copyfileobj 把源文件内容复制到目标
        # 参数 1：源文件对象（file.file）
        # 参数 2：目标文件对象（buffer）
        # 它会分块读取源文件写入目标，避免一次性占满内存
        shutil.copyfileobj(file.file, buffer)
    # 返回保存结果
    return {
        # "original_name": file.filename,
        "original_name": file.filename,
        # "saved_as": new_filename,
        "saved_as": new_filename,
        # "path": file_path,
        "path": file_path,
        # "size": os.path.getsize(file_path)
        "size": os.path.getsize(file_path)
    }
\`\`\`

### 异步保存文件

\`\`\`python
# 从 fastapi 导入 FastAPI, UploadFile, File, HTTPException
from fastapi import FastAPI, UploadFile, File, HTTPException
# 导入 aiofiles 模块（异步文件操作）
# 安装：pip install aiofiles
import aiofiles
# 导入 os, uuid
import os
import uuid

# 创建 FastAPI 应用实例
app = FastAPI()

# 上传目录
UPLOAD_DIR = "uploads_async"
# 创建目录
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 定义 POST 路由：访问 /upload-async-save 时触发
@app.post("/upload-async-save")
# 定义函数 upload_async_save（异步函数）
async def upload_async_save(file: UploadFile = File(...)):
    # 取扩展名
    ext = os.path.splitext(file.filename)[1]
    # 生成唯一文件名
    new_filename = f"{uuid.uuid4().hex}{ext}"
    # 拼接路径
    file_path = os.path.join(UPLOAD_DIR, new_filename)
    # 异步打开文件写入
    async with aiofiles.open(file_path, "wb") as out_file:
        # 分块读取并写入
        while True:
            # 异步读取一块（1MB）
            chunk = await file.read(1024 * 1024)
            # 如果读完
            if not chunk:
                break
            # 异步写入
            await out_file.write(chunk)
    # 返回结果
    return {
        # "saved_as": new_filename,
        "saved_as": new_filename,
        # "size": os.path.getsize(file_path)
        "size": os.path.getsize(file_path)
    }
\`\`\`

## 实战：头像上传 API

### Demo 5：完整头像上传 API（含图片校验）

\`\`\`python
# 从 fastapi 导入 FastAPI, UploadFile, File, HTTPException
from fastapi import FastAPI, UploadFile, File, HTTPException
# 导入 os, uuid, shutil
import os
import uuid
import shutil

# 创建 FastAPI 应用实例
app = FastAPI()

# 头像存储目录
AVATAR_DIR = "static/avatars"
# 创建目录
os.makedirs(AVATAR_DIR, exist_ok=True)

# 允许的图片类型
ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp"
}
# 最大文件大小：2MB
MAX_SIZE = 2 * 1024 * 1024

# 模拟用户数据库
users_avatars = {}

# 定义 POST 路由：访问 /users/{user_id}/avatar 时触发
@app.post("/users/{user_id}/avatar")
# 定义函数 upload_avatar
def upload_avatar(
    # user_id: 路径参数
    user_id: int,
    # file: 头像文件
    file: UploadFile = File(...)
):
    # 1. 校验文件类型
    if file.content_type not in ALLOWED_TYPES:
        # 抛出 400 错误
        raise HTTPException(
            status_code=400,
            detail=f"头像格式不支持，只允许: {', '.join(ALLOWED_TYPES.keys())}"
        )
    # 2. 读取文件内容
    contents = file.file.read()
    # 3. 校验文件大小
    if len(contents) > MAX_SIZE:
        # 抛出 400 错误
        raise HTTPException(status_code=400, detail="头像不能超过 2MB")
    # 4. 校验文件魔数（前几字节判断真实类型）
    # 魔数（magic number）是文件开头的固定字节，用于标识文件格式
    # 比 content_type 更可靠，因为 content_type 是客户端声明的，可以被伪造
    # JPEG 文件以 FF D8 FF 开头（十六进制）
    # PNG 文件以 89 50 4E 47 开头（十六进制，对应 ASCII "‰PNG"）
    if file.content_type == "image/jpeg":
        # 检查 JPEG 魔数
        # contents[:3] 取前 3 个字节
        # b'\\xff\\xd8\\xff' 是 JPEG 文件的魔数（十六进制字节串）
        # \\xff 是十六进制 255，\\xd8 是 216，组合起来是 JPEG 的起始标记
        if not contents[:3] == b'\\xff\\xd8\\xff':
            raise HTTPException(status_code=400, detail="文件不是真正的 JPEG")
    elif file.content_type == "image/png":
        # 检查 PNG 魔数
        # contents[:4] 取前 4 个字节
        # b'\\x89PNG' 是 PNG 文件的魔数
        # \\x89 是十六进制 137，后面跟 ASCII 字符 "PNG"
        # 完整的 PNG 魔数是 89 50 4E 47 0D 0A 1A 0A，前 4 字节足够识别
        if not contents[:4] == b'\\x89PNG':
            raise HTTPException(status_code=400, detail="文件不是真正的 PNG")
    # 5. 生成唯一文件名
    ext = ALLOWED_TYPES[file.content_type]
    # 文件名格式：avatar_{user_id}_{uuid}.jpg
    new_filename = f"avatar_{user_id}_{uuid.uuid4().hex}{ext}"
    # 拼接路径
    file_path = os.path.join(AVATAR_DIR, new_filename)
    # 6. 保存文件
    with open(file_path, "wb") as buffer:
        # 写入内容
        buffer.write(contents)
    # 7. 删除旧头像（如果存在）
    if user_id in users_avatars:
        # 取旧文件路径
        old_path = users_avatars[user_id]["path"]
        # 如果旧文件存在，删除
        if os.path.exists(old_path):
            os.remove(old_path)
    # 8. 记录到数据库
    users_avatars[user_id] = {
        # "filename": new_filename,
        "filename": new_filename,
        # "path": file_path,
        "path": file_path,
        # "url": f"/static/avatars/{new_filename}",
        "url": f"/static/avatars/{new_filename}",
        # "size": len(contents)
        "size": len(contents)
    }
    # 9. 返回结果
    return {
        # "message": "头像上传成功",
        "message": "头像上传成功",
        # "user_id": user_id,
        "user_id": user_id,
        # "avatar_url": users_avatars[user_id]["url"],
        "avatar_url": users_avatars[user_id]["url"],
        # "size": len(contents)
        "size": len(contents)
    }

# 定义 GET 路由：访问 /users/{user_id}/avatar 时触发，查询头像
@app.get("/users/{user_id}/avatar")
# 定义函数 get_avatar
def get_avatar(user_id: int):
    # 如果用户没有头像
    if user_id not in users_avatars:
        # 抛出 404
        raise HTTPException(status_code=404, detail="用户未上传头像")
    # 返回头像信息
    return users_avatars[user_id]
\`\`\`

**要点总结：**

1. \`File(bytes)\` 适合小文件，\`UploadFile\` 适合所有场景（推荐）。
2. \`UploadFile\` 有 \`filename\`、\`content_type\`、\`size\`、\`file\` 属性。
3. 同步用 \`file.file.read()\`，异步用 \`await file.read()\`。
4. 大文件用分块读取（\`await file.read(chunk_size)\`）避免内存暴涨。
5. \`list[UploadFile]\` 接收多文件。
6. 手动校验文件类型（\`content_type\`）、扩展名、大小、魔数。
7. \`shutil.copyfileobj\` 或 \`aiofiles\` 把文件存到磁盘。
8. 生成唯一文件名（UUID）防止重名覆盖。
`,
  },

  // ============================================================
  // 第 12 章：Body 字段与 Field
  // ============================================================
  {
    id: "fa-field",
    group: "请求体与表单",
    icon: "🔧",
    title: "Body 字段与 Field",
    content: `# Body 字段与 Field

## Body() 单独声明 body 参数

通常我们用 \`BaseModel\` 接收 JSON body。但有时只需要一个简单的值（比如一个字符串、一个数字、一个列表），不想定义整个模型。这时可以用 \`Body()\`。

### 不用 BaseModel，直接接收单个值

\`\`\`python
# 从 fastapi 导入 FastAPI, Body
from fastapi import FastAPI, Body

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /message 时触发
@app.post("/message")
# 定义函数 send_message
# 参数: message: str = Body(...)（body 就是一个字符串）
def send_message(message: str = Body(...)):
    # body 是纯字符串 "hello"，不是 {"message": "hello"}
    # 返回字典
    return {
        # "message": message,
        "message": message,
        # "length": len(message)
        "length": len(message)
    }
\`\`\`

请求示例：

\`\`\`bash
# body 直接是字符串
curl -X POST http://localhost:8000/message \\
  -H "Content-Type: application/json" \\
  -d '"hello"'
\`\`\`

注意 body 是 \`"hello"\`（带引号的 JSON 字符串），不是 \`{"message": "hello"}\`。

### 接收数字

\`\`\`python
# 定义 POST 路由：访问 /square 时触发
@app.post("/square")
# 定义函数 calc_square
# 参数: number: int = Body(...)
def calc_square(number: int = Body(...)):
    # body 是一个数字
    # 返回平方
    return {
        # "input": number,
        "input": number,
        # "square": number ** 2
        "square": number ** 2
    }
\`\`\`

请求：

\`\`\`bash
curl -X POST http://localhost:8000/square \\
  -H "Content-Type: application/json" \\
  -d '5'
\`\`\`

### 接收列表

\`\`\`python
# 定义 POST 路由：访问 /sum 时触发
@app.post("/sum")
# 定义函数 calc_sum
# 参数: numbers: list[int] = Body(...)
def calc_sum(numbers: list[int] = Body(...)):
    # body 是一个数组 [1, 2, 3]
    # 返回总和
    return {
        # "numbers": numbers,
        "numbers": numbers,
        # "sum": sum(numbers)
        "sum": sum(numbers)
    }
\`\`\`

请求：

\`\`\`bash
curl -X POST http://localhost:8000/sum \\
  -H "Content-Type: application/json" \\
  -d '[1, 2, 3, 4, 5]'
\`\`\`

### Demo 1：Body() 单值参数

\`\`\`python
# 从 fastapi 导入 FastAPI, Body
from fastapi import FastAPI, Body

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /echo 时触发
@app.post("/echo")
# 定义函数 echo
# 参数: text: str = Body(..., min_length=1, max_length=100)
def echo(text: str = Body(..., min_length=1, max_length=100)):
    # body 是字符串
    # 返回回显
    return {
        # "echo": text,
        "echo": text,
        # "length": len(text)
        "length": len(text)
    }

# 定义 POST 路由：访问 /max 时触发
@app.post("/max")
# 定义函数 find_max
# 参数: numbers: list[int] = Body(...)
def find_max(numbers: list[int] = Body(...)):
    # body 是数字数组
    # 检查数组非空
    if not numbers:
        # 如果空数组，返回 null
        return {"max": None}
    # 返回最大值
    return {
        # "numbers": numbers,
        "numbers": numbers,
        # "max": max(numbers),
        "max": max(numbers),
        # "min": min(numbers)
        "min": min(numbers)
    }
\`\`\`

## Body() 嵌入式请求体（embed=True）

### 默认行为

当函数只有一个 \`BaseModel\` 参数时，FastAPI 把整个 body 当作这个模型：

\`\`\`python
# 定义 Pydantic 数据模型 Item，继承 BaseModel
class Item(BaseModel):
    # 字段 name，类型: str
    name: str

# 定义 POST 路由：访问 /items 时触发
@app.post("/items")
# 定义函数 create_item，参数: item: Item
def create_item(item: Item):
    # body 格式：{"name": "phone"}
    # 直接是 Item 的字段，没有外层 key
    return item
\`\`\`

### 用 embed=True 嵌入

如果想让 body 带上参数名作为 key，用 \`Body(embed=True)\`：

\`\`\`python
# 从 fastapi 导入 FastAPI, Body
from fastapi import FastAPI, Body

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 Pydantic 数据模型 Item，继承 BaseModel
class Item(BaseModel):
    # 字段 name，类型: str
    name: str

# 定义 POST 路由：访问 /items-embed 时触发
@app.post("/items-embed")
# 定义函数 create_item
# 参数: item: Item = Body(embed=True)
def create_item(item: Item = Body(embed=True)):
    # body 格式：{"item": {"name": "phone"}}
    # 多了一层 "item" key
    return item
\`\`\`

### embed=True 的使用场景

1. **前端约定的格式**：前端传 \`{"item": {...}}\` 而不是 \`{...}\`
2. **多个单值 Body 参数**：让每个值都有自己的 key
3. **API 一致性**：所有接口 body 都是 \`{"key": value}\` 格式

\`\`\`python
# 定义 POST 路由：访问 /multi-body 时触发
@app.post("/multi-body")
# 定义函数 multi_body
def multi_body(
    # name 嵌入 body
    name: str = Body(..., embed=True),
    # age 嵌入 body
    age: int = Body(..., embed=True)
):
    # body 格式：{"name": "alice", "age": 25}
    # 两个单值参数都有自己的 key
    return {
        # "name": name,
        "name": name,
        # "age": age
        "age": age
    }
\`\`\`

## Field() 字段约束详解

\`Field()\` 是 Pydantic 提供的字段配置函数，用于给模型字段加约束和元数据。它替代了直接写默认值。

\`\`\`python
# 从 pydantic 导入 BaseModel, Field
from pydantic import BaseModel, Field

# 定义 Pydantic 数据模型 Item，继承 BaseModel
class Item(BaseModel):
    # 用 Field 替代直接写默认值
    # Field(...) 第一个参数 ... 表示必填
    # Field("default") 第一个参数是默认值表示可选
    name: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., gt=0)
    description: str | None = Field(None, max_length=500)
\`\`\`

## Field 的 default、default_factory

### default

\`default\` 设置字段的默认值。\`...\`（Ellipsis）表示必填，\`None\` 表示可选且默认 None。

\`\`\`python
# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # name: 必填（用 ...）
    name: str = Field(...)
    # age: 可选，默认 None
    age: int | None = Field(None)
    # is_active: 可选，默认 True
    is_active: bool = Field(True)
    # tags: 可选，默认空列表
    tags: list[str] = Field(default=[])
\`\`\`

### default_factory

\`default_factory\` 接收一个**无参函数**，每次创建实例时调用它生成默认值。适合需要动态生成默认值的场景。

\`\`\`python
# 从 pydantic 导入 BaseModel, Field
from pydantic import BaseModel, Field
# 导入 uuid 模块
import uuid
# 从 datetime 导入 datetime
from datetime import datetime

# 定义 Pydantic 数据模型 Task，继承 BaseModel
class Task(BaseModel):
    # id: 用 default_factory 生成唯一 ID
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    # created_at: 用 default_factory 生成当前时间
    created_at: datetime = Field(default_factory=datetime.now)
    # title: 必填
    title: str = Field(...)
    # done: 可选，默认 False
    done: bool = Field(False)

# 创建实例
# task = Task(title="学习 FastAPI")
# task.id 会是自动生成的 UUID
# task.created_at 会是当前时间
\`\`\`

**default vs default_factory 区别：**

- \`default=42\`：每次创建实例，默认值都是 42（固定值）
- \`default_factory=list\`：每次创建实例，调用 \`list()\` 生成新空列表（动态值）
- \`default_factory=datetime.now\`：每次创建实例，调用 \`datetime.now()\` 生成当前时间

## Field 的 title、description、example

\`Field()\` 可以设置文档相关的元数据：

- \`title\`：字段标题（文档显示）
- \`description\`：字段描述（文档显示）
- \`example\`：示例值（文档显示）
- \`examples\`：多个示例值

\`\`\`python
# 从 pydantic 导入 BaseModel, Field
from pydantic import BaseModel, Field

# 定义 Pydantic 数据模型 Product，继承 BaseModel
class Product(BaseModel):
    # name: 标题、描述、示例
    name: str = Field(
        ...,
        title="商品名称",
        description="商品的显示名称，不能为空",
        example="MacBook Pro 14"
    )
    # price: 标题、描述、示例
    price: float = Field(
        ...,
        title="商品价格",
        description="商品单价，必须大于 0",
        gt=0,
        example=12999.0
    )
    # stock: 标题、描述、示例
    stock: int = Field(
        default=0,
        title="库存数量",
        description="商品当前库存，不能为负",
        ge=0,
        example=100
    )
\`\`\`

这些元数据会显示在 Swagger UI（\`/docs\`）和 ReDoc（\`/redoc\`）里，让 API 文档更清晰。

## Field 的约束参数

### 字符串约束

- \`min_length\`：最小长度
- \`max_length\`：最大长度
- \`pattern\`：正则匹配（Pydantic v2，v1 用 \`regex\`）

\`\`\`python
# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # username: 3-20 字符
    username: str = Field(..., min_length=3, max_length=20)
    # password: 至少 8 字符，必须含字母和数字（正则）
    password: str = Field(
        ...,
        min_length=8,
        pattern=r"^(?=.*[a-zA-Z])(?=.*\\d).+$"
    )
    # email: 正则匹配邮箱
    email: str = Field(
        ...,
        pattern=r"^[\\w.-]+@[\\w.-]+\\.\\w+$"
    )
    # phone: 11 位数字
    phone: str = Field(..., pattern=r"^\\d{11}$")
\`\`\`

### 数值约束

- \`gt\`：大于（>）
- \`ge\`：大于等于（>=）
- \`lt\`：小于（<）
- \`le\`：小于等于（<=）

\`\`\`python
# 定义 Pydantic 数据模型 Product，继承 BaseModel
class Product(BaseModel):
    # price: 大于 0
    price: float = Field(..., gt=0)
    # discount: 0-1 之间（折扣率）
    discount: float = Field(..., ge=0, le=1)
    # stock: 大于等于 0
    stock: int = Field(..., ge=0)
    # rating: 0-5 之间
    rating: float = Field(..., ge=0, le=5)
    # max_quantity: 最多买 99 个
    max_quantity: int = Field(..., gt=0, lt=100)
\`\`\`

### 集合约束

- \`min_length\` / \`max_length\`：列表长度（Pydantic v2）
- Pydantic v1 用 \`min_items\` / \`max_items\`

\`\`\`python
# 定义 Pydantic 数据模型 Order，继承 BaseModel
class Order(BaseModel):
    # items: 至少 1 个，最多 50 个
    items: list[str] = Field(..., min_length=1, max_length=50)
    # tags: 0-10 个
    tags: list[str] = Field(default=[], max_length=10)
\`\`\`

### Demo 2：用户注册（Field 约束）

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel, Field
from pydantic import BaseModel, Field

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 Pydantic 数据模型 UserRegister，继承 BaseModel
class UserRegister(BaseModel):
    # username: 3-20 字符，只能字母数字下划线
    username: str = Field(
        ...,
        min_length=3,
        max_length=20,
        pattern=r"^[a-zA-Z0-9_]+$",
        title="用户名",
        description="3-20 个字符，只能字母数字下划线",
        example="alice_2024"
    )
    # email: 邮箱格式
    email: str = Field(
        ...,
        pattern=r"^[\\w.-]+@[\\w.-]+\\.\\w+$",
        title="邮箱",
        example="alice@example.com"
    )
    # password: 8-32 字符
    password: str = Field(
        ...,
        min_length=8,
        max_length=32,
        title="密码",
        description="8-32 个字符",
        example="secure123"
    )
    # age: 13-120
    age: int = Field(
        ...,
        ge=13,
        le=120,
        title="年龄",
        example=25
    )
    # balance: 余额，大于等于 0
    balance: float = Field(
        default=0,
        ge=0,
        title="账户余额"
    )

# 定义 POST 路由：访问 /register 时触发
@app.post("/register")
# 定义函数 register，参数: user: UserRegister
def register(user: UserRegister):
    # 返回注册信息
    return {
        # "username": user.username,
        "username": user.username,
        # "email": user.email,
        "email": user.email,
        # "age": user.age,
        "age": user.age,
        # "balance": user.balance
        "balance": user.balance
    }
\`\`\`

## 嵌套模型的 Field 约束

Field 约束也可以用在嵌套模型上。

### Demo 3：订单 API（嵌套 + Field 约束）

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel, Field
from pydantic import BaseModel, Field

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 Pydantic 数据模型 OrderItem，继承 BaseModel
class OrderItem(BaseModel):
    # product_id: 大于 0
    product_id: int = Field(..., gt=0, title="商品ID")
    # name: 1-100 字符
    name: str = Field(..., min_length=1, max_length=100, title="商品名称")
    # quantity: 1-99
    quantity: int = Field(..., gt=0, lt=100, title="购买数量")
    # unit_price: 大于 0
    unit_price: float = Field(..., gt=0, title="单价")

# 定义 Pydantic 数据模型 ShippingAddress，继承 BaseModel
class ShippingAddress(BaseModel):
    # recipient: 2-50 字符
    recipient: str = Field(..., min_length=2, max_length=50, title="收件人")
    # phone: 11 位数字
    phone: str = Field(..., pattern=r"^\\d{11}$", title="手机号")
    # address: 10-200 字符
    address: str = Field(..., min_length=10, max_length=200, title="详细地址")
    # city: 2-50 字符
    city: str = Field(..., min_length=2, max_length=50, title="城市")

# 定义 Pydantic 数据模型 Order，继承 BaseModel
class Order(BaseModel):
    # order_id: 必填
    order_id: str = Field(..., title="订单号")
    # items: 列表，至少 1 个，最多 100 个
    items: list[OrderItem] = Field(
        ...,
        min_length=1,
        max_length=100,
        title="订单商品列表"
    )
    # shipping: 嵌套模型
    shipping: ShippingAddress = Field(..., title="收货地址")
    # remark: 可选，最多 500 字符
    remark: str | None = Field(None, max_length=500, title="备注")

# 定义 POST 路由：访问 /orders 时触发
@app.post("/orders")
# 定义函数 create_order，参数: order: Order
def create_order(order: Order):
    # 计算总金额
    # 遍历 items，quantity * unit_price 求和
    total = sum(item.quantity * item.unit_price for item in order.items)
    # 计算总件数
    total_count = sum(item.quantity for item in order.items)
    # 返回订单摘要
    return {
        # "order_id": order.order_id,
        "order_id": order.order_id,
        # "item_types": len(order.items),
        "item_types": len(order.items),
        # "total_count": total_count,
        "total_count": total_count,
        # "total_price": total,
        "total_price": total,
        # "recipient": order.shipping.recipient,
        "recipient": order.shipping.recipient,
        # "city": order.shipping.city
        "city": order.shipping.city
    }
\`\`\`

## Field 的高级用法

### exclude 排除字段

在响应模型里排除某些字段（如密码）：

\`\`\`python
# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # username: 公开
    username: str = Field(...)
    # password: 不想在响应里返回
    password: str = Field(..., exclude=True)
    # exclude=True 表示序列化时排除此字段
\`\`\`

### repr 控制打印

\`\`\`python
# 定义 Pydantic 数据模型 Config，继承 BaseModel
class Config(BaseModel):
    # api_key: 打印时不显示（安全考虑）
    api_key: str = Field(..., repr=False)
    # name: 正常显示
    name: str = Field(...)

# print(Config(api_key="secret", name="test"))
# 输出: Config(name='test')  ← api_key 不显示
\`\`\`

### frozen 冻结字段

\`\`\`python
# 定义 Pydantic 数据模型 Point，继承 BaseModel
class Point(BaseModel):
    # x: 冻结，创建后不能修改
    x: float = Field(..., frozen=True)
    # y: 冻结
    y: float = Field(..., frozen=True)

# point = Point(x=1, y=2)
# point.x = 3  # 会报错！frozen 字段不能修改
\`\`\`

## 实战：商品创建 API

### Demo 4：完整商品创建 API（含所有约束）

\`\`\`python
# 从 fastapi 导入 FastAPI, HTTPException
from fastapi import FastAPI, HTTPException
# 从 pydantic 导入 BaseModel, Field
from pydantic import BaseModel, Field
# 导入 uuid 模块
import uuid
# 从 datetime 导入 datetime
from datetime import datetime

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 Pydantic 数据模型 Category，继承 BaseModel
class Category(BaseModel):
    # id: 大于 0
    id: int = Field(..., gt=0, title="分类ID")
    # name: 1-50 字符
    name: str = Field(..., min_length=1, max_length=50, title="分类名称")

# 定义 Pydantic 数据模型 ProductCreate，继承 BaseModel
class ProductCreate(BaseModel):
    # name: 1-200 字符
    name: str = Field(
        ...,
        min_length=1,
        max_length=200,
        title="商品名称",
        description="商品的显示名称",
        example="MacBook Pro 14寸"
    )
    # sku: 3-50 字符，字母数字
    sku: str = Field(
        ...,
        min_length=3,
        max_length=50,
        pattern=r"^[A-Z0-9-]+$",
        title="SKU编码",
        description="大写字母、数字、短横线",
        example="MBP-14-2024"
    )
    # price: 大于 0
    price: float = Field(
        ...,
        gt=0,
        title="商品价格",
        description="单价，必须大于 0",
        example=12999.0
    )
    # original_price: 可选，大于 0
    original_price: float | None = Field(
        None,
        gt=0,
        title="原价",
        description="如有促销，填原价"
    )
    # stock: 大于等于 0
    stock: int = Field(
        ...,
        ge=0,
        title="库存数量",
        example=100
    )
    # description: 可选，最多 2000 字符
    description: str | None = Field(
        None,
        max_length=2000,
        title="商品描述",
        example="苹果笔记本电脑"
    )
    # categories: 分类列表，至少 1 个
    categories: list[Category] = Field(
        ...,
        min_length=1,
        title="商品分类",
        description="至少一个分类"
    )
    # tags: 可选，最多 20 个标签
    tags: list[str] = Field(
        default=[],
        max_length=20,
        title="商品标签"
    )
    # weight: 可选，大于 0（单位 kg）
    weight: float | None = Field(
        None,
        gt=0,
        title="商品重量(kg)",
        example=1.6
    )
    # is_active: 是否上架，默认 True
    is_active: bool = Field(
        True,
        title="是否上架"
    )

# 定义 Pydantic 数据模型 ProductResponse，继承 BaseModel
class ProductResponse(BaseModel):
    # id: 商品ID
    id: str
    # name: 商品名称
    name: str
    # sku: SKU
    sku: str
    # price: 价格
    price: float
    # stock: 库存
    stock: int
    # is_active: 是否上架
    is_active: bool
    # created_at: 创建时间
    created_at: datetime

# 模拟数据库
products_db = {}

# 定义 POST 路由：访问 /products 时触发
@app.post("/products", response_model=ProductResponse)
# 定义函数 create_product，参数: product: ProductCreate
def create_product(product: ProductCreate):
    # 检查 SKU 是否重复
    for existing in products_db.values():
        # 如果 SKU 已存在
        if existing["sku"] == product.sku:
            # 抛出 400 错误
            raise HTTPException(status_code=400, detail=f"SKU '{product.sku}' 已存在")
    # 检查原价和现价
    if product.original_price and product.original_price < product.price:
        # 原价不能小于现价
        raise HTTPException(status_code=400, detail="原价不能小于现价")
    # 生成商品记录
    product_record = {
        # "id": uuid.uuid4().hex,
        # uuid.uuid4() 生成随机 UUID 对象
        # .hex 取 32 位十六进制字符串（无连字符）
        # 作为商品 ID，保证全局唯一，避免自增 ID 的冲突问题
        "id": uuid.uuid4().hex,
        # "name": product.name,
        "name": product.name,
        # "sku": product.sku,
        "sku": product.sku,
        # "price": product.price,
        "price": product.price,
        # "stock": product.stock,
        "stock": product.stock,
        # "is_active": product.is_active,
        "is_active": product.is_active,
        # "created_at": datetime.now()
        # datetime.now() 返回当前本地时间（不带时区信息）
        # 实际项目推荐用 datetime.utcnow() 或 datetime.now(timezone.utc) 存 UTC 时间
        "created_at": datetime.now()
    }
    # 存入数据库
    # 用 product_record["id"]（UUID 字符串）作为字典的键
    products_db[product_record["id"]] = product_record
    # 返回响应（按 response_model 过滤）
    # response_model=ProductResponse 指定了响应结构
    # FastAPI 会自动把 product_record 按 ProductResponse 的字段过滤
    # ProductResponse 只有 id/name/sku/price/stock/is_active/created_at
    # 所以 product_record 里的其他字段（如 categories、tags）不会出现在响应里
    return product_record

# 定义 GET 路由：访问 /products/{product_id} 时触发
@app.get("/products/{product_id}", response_model=ProductResponse)
# 定义函数 get_product
def get_product(product_id: str):
    # 如果商品不存在
    if product_id not in products_db:
        # 抛出 404
        raise HTTPException(status_code=404, detail="商品不存在")
    # 返回商品
    return products_db[product_id]
\`\`\`

### Demo 5：博客文章创建 API（综合 Field）

\`\`\`python
# 从 fastapi 导入 FastAPI, HTTPException
from fastapi import FastAPI, HTTPException
# 从 pydantic 导入 BaseModel, Field
from pydantic import BaseModel, Field
# 导入 uuid
import uuid
# 从 datetime 导入 datetime
from datetime import datetime

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 Pydantic 数据模型 Tag，继承 BaseModel
class Tag(BaseModel):
    # name: 1-30 字符
    name: str = Field(..., min_length=1, max_length=30)

# 定义 Pydantic 数据模型 ArticleCreate，继承 BaseModel
class ArticleCreate(BaseModel):
    # title: 1-200 字符
    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        title="文章标题",
        example="FastAPI 入门指南"
    )
    # slug: URL 友好名，正则匹配
    # slug 是文章在 URL 中的标识符，如 /articles/fastapi-getting-started
    # 相比用 ID（如 /articles/123），slug 更 SEO 友好、更易读
    # 规则：小写字母、数字、短横线，不能以短横线开头或结尾，不能连续短横线
    slug: str = Field(
        ...,
        min_length=3,
        max_length=100,
        # 正则解释：^[a-z0-9]+(?:-[a-z0-9]+)*$
        # ^[a-z0-9]+  开头是 1 个或多个小写字母/数字
        # (?:-[a-z0-9]+)*  后面跟着 0 个或多个 "-小写字母数字" 组合
        # $  结尾
        # 整体匹配：fastapi-getting-started ✓，-fastapi ✗，fastapi--x ✗
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
        title="URL别名",
        description="小写字母、数字、短横线",
        example="fastapi-getting-started"
    )
    # content: 至少 10 字符
    content: str = Field(
        ...,
        min_length=10,
        title="文章内容",
        example="这是一篇关于 FastAPI 的文章..."
    )
    # excerpt: 可选，最多 300 字符
    excerpt: str | None = Field(
        None,
        max_length=300,
        title="摘要"
    )
    # tags: 标签列表，0-10 个
    tags: list[Tag] = Field(
        default=[],
        max_length=10,
        title="标签"
    )
    # status: 只能是 draft/published/archived
    status: str = Field(
        "draft",
        pattern=r"^(draft|published|archived)$",
        title="文章状态"
    )
    # reading_time: 阅读时间（分钟），大于 0
    reading_time: int = Field(
        default=1,
        gt=0,
        le=600,
        title="预计阅读时间(分钟)"
    )

# 模拟数据库
articles_db = {}

# 定义 POST 路由：访问 /articles 时触发
@app.post("/articles")
# 定义函数 create_article，参数: article: ArticleCreate
def create_article(article: ArticleCreate):
    # 检查 slug 是否重复
    for existing in articles_db.values():
        # 如果 slug 已存在
        if existing["slug"] == article.slug:
            # 抛出 400 错误
            raise HTTPException(status_code=400, detail="slug 已存在")
    # 如果没有 excerpt，自动生成
    excerpt = article.excerpt
    if excerpt is None:
        # 取 content 前 200 字符
        # 三元表达式：A if 条件 else B
        # 如果 content 长度 > 200，取前 200 字符 + "..."
        # 否则取完整 content（不加分隔符，避免短文章后面跟多余的 "..."）
        # article.content[:200] 是字符串切片，取索引 0 到 199 的字符（共 200 个）
        excerpt = article.content[:200] + "..." if len(article.content) > 200 else article.content
    # 构造文章记录
    record = {
        # "id": uuid.uuid4().hex,
        "id": uuid.uuid4().hex,
        # "title": article.title,
        "title": article.title,
        # "slug": article.slug,
        "slug": article.slug,
        # "content": article.content,
        "content": article.content,
        # "excerpt": excerpt,
        "excerpt": excerpt,
        # "tags": [t.name for t in article.tags],
        "tags": [t.name for t in article.tags],
        # "status": article.status,
        "status": article.status,
        # "reading_time": article.reading_time,
        "reading_time": article.reading_time,
        # "created_at": datetime.now()
        "created_at": datetime.now()
    }
    # 存入数据库
    articles_db[record["id"]] = record
    # 返回结果
    return {
        # "id": record["id"],
        "id": record["id"],
        # "title": record["title"],
        "title": record["title"],
        # "slug": record["slug"],
        "slug": record["slug"],
        # "excerpt": record["excerpt"],
        "excerpt": record["excerpt"],
        # "tags": record["tags"],
        "tags": record["tags"],
        # "status": record["status"],
        "status": record["status"],
        # "message": "文章创建成功"
        "message": "文章创建成功"
    }
\`\`\`

## Pydantic v1 vs v2 的 Field 差异

| 功能 | Pydantic v1 | Pydantic v2 |
|------|-------------|-------------|
| 正则 | \`regex=...\` | \`pattern=...\` |
| 列表长度 | \`min_items\` / \`max_items\` | \`min_length\` / \`max_length\` |
| 必填 | \`...\` 或 \`Field(...)\` | \`...\` 或 \`Field(...)\` |
| 示例 | \`Field(example=...)\` | \`Field(example=...)\`（也支持 \`examples=[...]\`） |
| 模型转 dict | \`.dict()\` | \`.model_dump()\` |
| 模型转 JSON | \`.json()\` | \`.model_dump_json()\` |
| 从 dict 创建 | \`.parse_obj()\` | \`.model_validate()\` |

FastAPI 0.100+ 默认用 Pydantic v2。如果你的项目用 v1，注意 API 差异。

**要点总结：**

1. \`Body()\` 不用 BaseModel 也能接收 body，适合单值场景。
2. \`Body(embed=True)\` 让 body 带上参数名作为 key。
3. \`Field()\` 给模型字段加约束和元数据。
4. \`default\` 设固定默认值，\`default_factory\` 设动态默认值。
5. \`title\`、\`description\`、\`example\` 改善文档可读性。
6. 数值约束：\`gt\`、\`ge\`、\`lt\`、\`le\`；字符串约束：\`min_length\`、\`max_length\`、\`pattern\`。
7. 嵌套模型的每个字段都可以单独加 \`Field\` 约束。
8. \`exclude=True\` 排除字段，\`repr=False\` 隐藏打印，\`frozen=True\` 冻结字段。
`,
  },
];
