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

## 生活类比：请求体像快递包裹里的货物

把一次 HTTP 请求想象成"寄快递"：

- **请求行**（method + URL）→ 快递单上的"收件地址"和"服务类型"（如：北京市朝阳区 / 次日达）
- **请求头**（headers）→ 快递单上的"附加信息"（如：易碎品、保价 1000 元）
- **请求体**（body）→ **包裹里真正装的东西**（如：一本书、一台手机）

GET 请求就像"只填快递单不寄东西"——你只是问一句"这个地址有没有货"，不需要包裹。POST 请求就像"真的寄东西"——必须把货物装进包裹里。

而 \`BaseModel\` 就像**包裹里货物的装箱清单**：

- 清单上写明货物有哪些字段（如：姓名、邮箱、年龄）
- 清单规定每个字段的类型（如：年龄必须是整数）
- 清单标注哪些是必填（如：姓名必填）、哪些可选（如：备注可选）
- 收件时快递员（FastAPI）按清单核对货物，少了一件就退回（422 错误）

理解了这个类比，后面的 Pydantic 模型定义就很好懂了——你只是在写一张"装箱清单"。

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

### 生活类比：俄罗斯套娃

嵌套模型就像俄罗斯套娃——大套娃里装着小套娃：

- 外层 \`User\` 模型（大套娃）里有一个 \`Address\` 字段（小套娃）
- \`Address\` 里面还可以再嵌套 \`Country\`（更小的套娃）
- 打开 body 时，FastAPI 会一层层"拆套娃"，每层都做类型校验

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

### Demo 3：用户含地址的嵌套模型（渐进式 - 简单）

这是一个从简单开始的嵌套示例：用户只有一个地址字段。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 Pydantic 数据模型 Address，继承 BaseModel
# 这是内层模型（小套娃）
class Address(BaseModel):
    # 省份，必填
    province: str
    # 城市，必填
    city: str
    # 详细地址，必填
    detail: str
    # 邮编，可选（不是所有人都会填邮编）
    zip_code: str | None = None

# 定义 Pydantic 数据模型 User，继承 BaseModel
# 这是外层模型（大套娃）
class User(BaseModel):
    # 用户名，必填
    username: str
    # 年龄，可选
    age: int | None = None
    # address 字段类型是 Address（另一个 BaseModel）
    # 这就是"嵌套模型"——一个模型的字段是另一个模型
    # FastAPI 会递归解析：先解析外层 User，再解析内层 Address
    address: Address

# 定义 POST 路由：访问 /users 时触发
@app.post("/users")
# 定义函数 create_user，参数: user: User
def create_user(user: User):
    # user.address 是 Address 实例，可以继续用点号访问
    # user.address.city 取出嵌套的城市字段
    return {
        # "username": user.username,
        "username": user.username,
        # "city": user.address.city,
        "city": user.address.city,
        # "full_address": f"{user.address.province}{user.address.city}{user.address.detail}"
        # f-string 是 Python 3.6+ 的格式化字符串语法
        # f"..." 里的 {} 会被替换成变量的值
        # 这里把省、市、详细地址拼成完整地址
        "full_address": f"{user.address.province}{user.address.city}{user.address.detail}"
    }
\`\`\`

请求示例：

\`\`\`json
{
  "username": "alice",
  "age": 25,
  "address": {
    "province": "北京",
    "city": "北京市",
    "detail": "朝阳区建国路 1 号",
    "zip_code": "100000"
  }
}
\`\`\`

### Demo 4：用户含多个地址（渐进式 - 中等）

用户有多个地址（地址列表）+ 一个主要地址。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 Pydantic 数据模型 Address，继承 BaseModel
class Address(BaseModel):
    # 地址标签：home（家）、work（公司）、other（其他）
    label: str
    # 详细地址
    detail: str
    # 是否默认地址
    is_default: bool = False

# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # 用户名
    username: str
    # primary_address：主要地址（单个 Address 嵌套）
    # 这是必填字段，每个用户必须有一个主要地址
    primary_address: Address
    # addresses：地址列表（list[Address] 嵌套）
    # 默认空列表，用户可以保存多个备用地址
    # list[Address] 表示列表里每个元素都是 Address 模型
    # FastAPI 会逐个校验列表中的每个地址对象
    addresses: list[Address] = []

# 定义 POST 路由：访问 /users-with-addresses 时触发
@app.post("/users-with-addresses")
# 定义函数 create_user
def create_user(user: User):
    # 统计地址数量
    # len(user.addresses) 返回列表长度
    address_count = len(user.addresses) + 1  # +1 是主要地址
    # 检查是否有默认地址
    # any() 函数：只要列表里有一个 True 就返回 True
    # 这里遍历 addresses 列表，检查是否有 is_default=True 的地址
    has_default = any(addr.is_default for addr in user.addresses)
    # 返回用户摘要
    return {
        # "username": user.username,
        "username": user.username,
        # "primary_address": user.primary_address.detail,
        "primary_address": user.primary_address.detail,
        # "address_count": address_count,
        "address_count": address_count,
        # "has_default": has_default
        "has_default": has_default
    }
\`\`\`

### Demo 5：深度嵌套 - 用户含订单含商品含评论（渐进式 - 复杂）

模拟真实电商场景：用户 → 订单列表 → 每个订单含多个商品 → 每个商品含评论。

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建 FastAPI 应用实例
app = FastAPI()

# ---- 第 1 层：评论（最内层）----
class Review(BaseModel):
    # 评论者名字
    reviewer: str
    # 评分 1-5
    rating: int
    # 评论内容，可选
    comment: str | None = None

# ---- 第 2 层：商品（含评论列表）----
class Product(BaseModel):
    # 商品 ID
    product_id: int
    # 商品名
    name: str
    # 单价
    price: float
    # 该商品的评论列表（嵌套 Review 模型）
    # 默认空列表，新商品可能还没有评论
    reviews: list[Review] = []

# ---- 第 3 层：订单（含商品列表）----
class Order(BaseModel):
    # 订单号
    order_id: str
    # 订单中的商品列表（嵌套 Product 模型）
    products: list[Product]
    # 订单状态
    status: str = "pending"

# ---- 第 4 层：用户（含订单列表，最外层）----
class User(BaseModel):
    # 用户名
    username: str
    # email
    email: str
    # 用户的订单列表（嵌套 Order 模型）
    # 这是最外层入口，FastAPI 会递归解析 4 层结构
    orders: list[Order] = []

# 定义 POST 路由：访问 /users-full 时触发
@app.post("/users-full")
# 定义函数 create_user
def create_user(user: User):
    # 计算用户所有订单的总金额
    # 嵌套循环：user → orders → products
    # 外层 for order in user.orders 遍历每个订单
    # 内层 for product in order.products 遍历订单里的每个商品
    # 累加 product.price
    total_spent = sum(
        product.price
        for order in user.orders
        for product in order.products
    )
    # 统计所有商品收到的评论数
    # 三层嵌套循环：user → orders → products → reviews
    total_reviews = sum(
        len(product.reviews)
        for order in user.orders
        for product in order.products
    )
    # 返回用户消费摘要
    return {
        # "username": user.username,
        "username": user.username,
        # "order_count": len(user.orders),
        "order_count": len(user.orders),
        # "total_spent": total_spent,
        "total_spent": total_spent,
        # "total_reviews": total_reviews
        "total_reviews": total_reviews
    }
\`\`\`

请求示例（4 层嵌套）：

\`\`\`json
{
  "username": "alice",
  "email": "alice@example.com",
  "orders": [
    {
      "order_id": "ORD-001",
      "status": "completed",
      "products": [
        {
          "product_id": 1,
          "name": "手机",
          "price": 1999.0,
          "reviews": [
            {"reviewer": "bob", "rating": 5, "comment": "很好用"}
          ]
        }
      ]
    }
  ]
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

### Demo 6：文章创建 API（含可选字段）

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

### Demo 7：带示例的商品模型

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
# list[Item] 表示 body 是 JSON 数组，每个元素都是 Item 模型
# FastAPI 会逐个校验数组中的每个对象，任意一个不通过都会返回 422
def create_items(items: list[Item]):
    # items 是 Item 实例列表（已经过 Pydantic 校验和类型转换）
    # 可以像普通 list 一样遍历：for item in items: print(item.name)
    # len(items) 返回列表长度，即批量创建的数量
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
    # populate_by_name=True 表示既可以用别名 "userName" 填充
    # 也可以用字段名 "user_name" 填充
    # 默认是 False，即只能用 alias 填充，不能用字段名
    # 应用场景：JSON 用驼峰（前端约定），Python 用蛇形（PEP 8 规范）
    model_config = ConfigDict(populate_by_name=True)
    # 字段 user_name，别名: "userName"（JSON 里用驼峰）
    # alias 指定 JSON 中的字段名，与 Python 属性名解耦
    # 接收 {"userName": "alice"} 时，会赋值给 user_name 属性
    user_name: str = Field(alias="userName")
    # 字段 created_at，别名: "createdAt"
    # 同样把 JSON 的驼峰名映射到 Python 的蛇形名
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

## 常见错误（Common Mistakes）

### 错误 1：忘加 \`Content-Type: application/json\` 头

\`\`\`bash
# ❌ 错误：没有 -H "Content-Type: application/json"
curl -X POST http://localhost:8000/users -d '{"username": "alice"}'

# FastAPI 默认期望 JSON，没声明 Content-Type 会报 422
# 错误信息：{"detail":[{"type":"missing","msg":"Field required",...}]}
\`\`\`

**正确写法：**

\`\`\`bash
# ✅ 加上 Content-Type 头
curl -X POST http://localhost:8000/users \\
  -H "Content-Type: application/json" \\
  -d '{"username": "alice", "email": "a@x.com"}'
\`\`\`

### 错误 2：必填字段缺失

\`\`\`python
class User(BaseModel):
    username: str  # 必填
    email: str     # 必填

# ❌ 提交时漏了 email
# curl -d '{"username": "alice"}'
# 返回 422: [{"type": "missing", "loc": ["body", "email"], "msg": "Field required"}]
\`\`\`

**排查方法**：看错误响应的 \`loc\` 字段，它告诉你哪个字段出了问题。`["body", "email"]` 表示 body 里的 email 字段。

### 错误 3：类型不匹配且无法转换

\`\`\`python
class Product(BaseModel):
    price: float
    stock: int

# ❌ price 传了非数字字符串
# curl -d '{"price": "abc", "stock": 10}'
# 返回 422: [{"type": "float_parsing", "loc": ["body", "price"], ...}]

# ❌ stock 传了浮点数（Pydantic v2 默认严格，不会把 10.5 转 10）
# curl -d '{"price": 99.9, "stock": 10.5}'
# 返回 422
\`\`\`

### 错误 4：嵌套模型字段名写错

\`\`\`json
// ❌ 错误：address 里的 city 写成了 City（大写）
{
  "username": "alice",
  "address": {
    "City": "北京",   // ❌ 应该是 "city"
    "street": "长安街"
  }
}

// ✅ 正确
{
  "username": "alice",
  "address": {
    "city": "北京",
    "street": "长安街"
  }
}
\`\`\`

**原因**：JSON 字段名严格区分大小写，必须和 Python 属性名完全一致（除非用 alias）。

### 错误 5：把 BaseModel 实例当 dict 用

\`\`\`python
class User(BaseModel):
    username: str

user = User(username="alice")

# ❌ 错误：用 ["username"] 访问（BaseModel 不支持）
# print(user["username"])  # TypeError

# ✅ 正确：用 .username 访问
print(user.username)  # alice

# ✅ 转成 dict 后可以用 []
print(user.model_dump()["username"])  # alice
\`\`\`

## 动手实验（Hands-on Experiments）

### 实验 1：创建一个"图书+作者+出版社"三层嵌套 API

**目标**：练习三层嵌套模型。

**要求**：
- 出版社（Publisher）：name、address
- 作者（Author）：name、age、publisher（嵌套 Publisher）
- 图书（Book）：title、author（嵌套 Author）

**参考答案：**

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# 第 1 层：出版社
class Publisher(BaseModel):
    name: str
    address: str

# 第 2 层：作者（含出版社）
class Author(BaseModel):
    name: str
    age: int
    publisher: Publisher  # 嵌套

# 第 3 层：图书（含作者）
class Book(BaseModel):
    title: str
    author: Author  # 嵌套

@app.post("/books")
def create_book(book: Book):
    # 三层访问：book.author.publisher.name
    return {
        "title": book.title,
        "author": book.author.name,
        "publisher": book.author.publisher.name
    }
\`\`\`

**测试用 body：**

\`\`\`json
{
  "title": "FastAPI 实战",
  "author": {
    "name": "张三",
    "age": 35,
    "publisher": {
      "name": "人民邮电出版社",
      "address": "北京"
    }
  }
}
\`\`\`

### 实验 2：批量创建用户（数组 body）

**目标**：练习 \`list[Model]\` 类型的 body。

**要求**：
- 接收 \`list[UserCreate]\` 作为 body
- 返回创建的用户数量和所有用户名

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class UserCreate(BaseModel):
    username: str
    email: str

@app.post("/users/batch")
def batch_create(users: list[UserCreate]):
    # users 是 UserCreate 实例列表
    # 列表推导式：[u.username for u in users] 提取所有用户名
    return {
        "count": len(users),
        "usernames": [u.username for u in users]
    }
\`\`\`

**测试用 body（JSON 数组）：**

\`\`\`json
[
  {"username": "alice", "email": "a@x.com"},
  {"username": "bob", "email": "b@x.com"},
  {"username": "charlie", "email": "c@x.com"}
]
\`\`\`

### 实验 3：混用路径参数 + 查询参数 + 请求体

**目标**：练习三种参数同时使用。

**要求**：
- 路径 \`/groups/{group_id}/users\`
- 查询参数 \`active\`（bool，默认 True）
- 请求体 \`UserCreate\`

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class UserCreate(BaseModel):
    username: str
    email: str

@app.post("/groups/{group_id}/users")
def add_user_to_group(
    group_id: int,           # 路径参数
    user: UserCreate,        # 请求体
    active: bool = True      # 查询参数
):
    return {
        "group_id": group_id,
        "user": user,
        "active": active
    }
\`\`\`

**测试请求：**

\`\`\`bash
curl -X POST "http://localhost:8000/groups/5/users?active=false" \\
  -H "Content-Type: application/json" \\
  -d '{"username": "alice", "email": "a@x.com"}'
\`\`\`

## 实战：用户注册 API

### Demo 8：完整的用户注册 API

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
3. 模型可嵌套，对应嵌套 JSON（如用户含地址、订单含商品）。
4. 路径参数、查询参数、请求体可混用，FastAPI 自动区分。
5. \`Field(..., example=...)\` 或 \`json_schema_extra\` 可定义文档示例。
6. \`response_model\` 可控制响应结构，过滤敏感字段。
7. 校验失败自动返回 422，无需手写校验代码。
8. \`list[Model]\` 可接收 JSON 数组 body，实现批量操作。
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

## 生活类比：表单就像填纸质表格

把表单提交想象成"去银行办业务填表格"：

- **JSON body** → 你递上一份"个人简历"（结构化文档，有章节、有列表、有嵌套）
- **表单数据** → 你在柜台填一张"申请表"（一格一格填，每格一个值，扁平结构）

纸质表格的特点：
- 每个格子有名字（如"姓名"、"电话"）
- 每个格子只能填简单文本（不能在格子里再画表格）
- 可以有多张相同格子的表格（如"紧急联系人 1"、"紧急联系人 2"）
- 文件可以夹在表格里一起交（这就是表单 + 文件上传）

而 \`Form()\` 就是 FastAPI 用来"接收纸质表格"的工具——它告诉 FastAPI："这个参数不是 JSON，是从表格格子里取的"。

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

### Demo 6：问卷调研 API（渐进式 - 表单列表）

模拟一份用户调研问卷，包含单选、多选、评分。

\`\`\`python
# 从 fastapi 导入 FastAPI, Form
from fastapi import FastAPI, Form

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /survey 时触发
@app.post("/survey")
# 定义函数 submit_survey
def submit_survey(
    # username: 参与者姓名
    username: str = Form(..., min_length=1, max_length=50),
    # age: 年龄段（单选）
    age_group: str = Form(..., pattern=r"^(18-25|26-35|36-45|46-55|55\\+)$"),
    # rating: 整体评分 1-5（单选数值）
    rating: int = Form(..., ge=1, le=5),
    # features: 喜欢的功能（多选，列表）
    # 重复传 features 字段实现多选：
    # -d "features=搜索" -d "features=推荐" -d "features=收藏"
    features: list[str] = Form(..., min_length=1),
    # suggestion: 改进建议（可选）
    suggestion: str = Form("", max_length=500),
    # recommend: 是否推荐给朋友（布尔）
    recommend: bool = Form(...)
):
    # 根据评分给反馈
    # rating 是 1-5 的整数
    if rating >= 4:
        feedback = "感谢您的好评！"
    elif rating >= 3:
        feedback = "感谢反馈，我们会继续努力！"
    else:
        feedback = "抱歉给您带来不好的体验，我们会改进。"
    # 返回问卷摘要
    return {
        # "username": username,
        "username": username,
        # "age_group": age_group,
        "age_group": age_group,
        # "rating": rating,
        "rating": rating,
        # "feature_count": len(features),
        "feature_count": len(features),
        # "features": features,
        "features": features,
        # "will_recommend": recommend,
        "will_recommend": recommend,
        # "feedback": feedback
        "feedback": feedback
    }
\`\`\`

请求示例：

\`\`\`bash
curl -X POST http://localhost:8000/survey \\
  -d "username=张三" \\
  -d "age_group=26-35" \\
  -d "rating=4" \\
  -d "features=搜索" \\
  -d "features=推荐" \\
  -d "features=收藏" \\
  -d "suggestion=希望增加夜间模式" \\
  -d "recommend=true"
\`\`\`

### Demo 7：商品发布 API（表单 + 多个文件）

模拟卖家发布商品：填写商品信息 + 上传多张商品图片。

\`\`\`python
# 从 fastapi 导入 FastAPI, Form, File, UploadFile, HTTPException
from fastapi import FastAPI, Form, File, UploadFile, HTTPException

# 创建 FastAPI 应用实例
app = FastAPI()

# 允许的图片类型
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
# 最大图片数量
MAX_IMAGES = 5
# 单张图片大小限制：3MB
MAX_IMAGE_SIZE = 3 * 1024 * 1024

# 定义 POST 路由：访问 /products 时触发
@app.post("/products")
# 定义函数 create_product
async def create_product(
    # name: 商品名，必填
    name: str = Form(..., min_length=1, max_length=100),
    # price: 价格，大于 0
    price: float = Form(..., gt=0),
    # stock: 库存，大于等于 0
    stock: int = Form(..., ge=0),
    # category: 分类
    category: str = Form(..., min_length=1, max_length=30),
    # description: 描述，可选
    description: str = Form("", max_length=2000),
    # images: 多张商品图片，列表
    # list[UploadFile] 接收多个文件
    images: list[UploadFile] = File(...)
):
    # 校验图片数量
    if len(images) > MAX_IMAGES:
        raise HTTPException(
            status_code=400,
            detail=f"最多上传 {MAX_IMAGES} 张图片"
        )
    # 校验每张图片
    image_infos = []
    for img in images:
        # 校验类型
        if img.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"图片 {img.filename} 格式不支持，只允许 JPEG/PNG/WebP"
            )
        # 读取内容校验大小
        contents = await img.read()
        if len(contents) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"图片 {img.filename} 超过 3MB 限制"
            )
        # 记录图片信息
        image_infos.append({
            "filename": img.filename,
            "content_type": img.content_type,
            "size": len(contents)
        })
    # 返回商品创建结果
    return {
        # "message": "商品发布成功",
        "message": "商品发布成功",
        # "product": {
        "product": {
            # "name": name,
            "name": name,
            # "price": price,
            "price": price,
            # "stock": stock,
            "stock": stock,
            # "category": category,
            "category": category,
            # "description": description
            "description": description
        },
        # "images": image_infos,
        "images": image_infos,
        # "image_count": len(image_infos)
        "image_count": len(image_infos)
    }
\`\`\`

请求示例：

\`\`\`bash
curl -X POST http://localhost:8000/products \\
  -F "name=MacBook Pro" \\
  -F "price=12999" \\
  -F "stock=10" \\
  -F "category=电脑" \\
  -F "description=苹果笔记本电脑" \\
  -F "images=@photo1.jpg" \\
  -F "images=@photo2.jpg" \\
  -F "images=@photo3.png"
\`\`\`

## 常见错误（Common Mistakes）

### 错误 1：用 \`-d\` 传 JSON 给表单接口

\`\`\`bash
# ❌ 错误：接口期望表单，但传了 JSON
curl -X POST http://localhost:8000/login \\
  -H "Content-Type: application/json" \\
  -d '{"username": "alice", "password": "123456"}'

# 返回 422，因为 FastAPI 找不到表单字段
\`\`\`

**正确写法：**

\`\`\`bash
# ✅ 用 -d 传表单（不带 Content-Type: application/json）
curl -X POST http://localhost:8000/login \\
  -d "username=alice" \\
  -d "password=123456"
\`\`\`

### 错误 2：Form 和 BaseModel 混用

\`\`\`python
from pydantic import BaseModel

class User(BaseModel):
    username: str

# ❌ 错误：不能同时用 BaseModel 和 Form
@app.post("/wrong")
def wrong(user: User, name: str = Form(...)):
    pass

# 启动时报错：AssertionError: cannot specify "Form" and "Body" params together
\`\`\`

**解决方法**：要么全用 \`Form()\`，要么全用 \`BaseModel\`。

### 错误 3：忘记 \`Form(...)\` 里的 \`...\`

\`\`\`python
# ❌ 错误：写成 Form() 不带参数
@app.post("/login")
def login(username: str = Form()):  # 缺少 ...
    pass

# Form() 不带参数会被当成可选字段，但更推荐明确写 Form(...) 表示必填
\`\`\`

### 错误 4：表单列表传错

\`\`\`bash
# ❌ 错误：想传列表，但写成了逗号分隔
curl -d "tags=python,fastapi,web"
# tags 会是 ["python,fastapi,web"]（一个元素的列表）

# ✅ 正确：重复传同一个 key
curl -d "tags=python" -d "tags=fastapi" -d "tags=web"
# tags 会是 ["python", "fastapi", "web"]
\`\`\`

### 错误 5：表单字段名和参数名不一致

\`\`\`python
# 参数名是 username
@app.post("/login")
def login(username: str = Form(...)):
    pass

# ❌ 错误：表单里传的是 user_name
# curl -d "user_name=alice"
# FastAPI 找不到 username 字段，返回 422

# ✅ 正确：表单字段名必须和参数名一致
# curl -d "username=alice"
\`\`\`

## 动手实验（Hands-on Experiments）

### 实验 1：创建一个"投票 API"

**目标**：练习表单基础用法。

**要求**：
- 接收 \`candidate\`（候选人名）、\`voter\`（投票人名）
- 候选人只能是 "alice"、"bob"、"charlie" 之一
- 记录票数，返回当前排名

\`\`\`python
from fastapi import FastAPI, Form, HTTPException
from fastapi.responses import JSONResponse

app = FastAPI()

# 票数统计
votes = {"alice": 0, "bob": 0, "charlie": 0}

@app.post("/vote")
def vote(
    candidate: str = Form(..., pattern=r"^(alice|bob|charlie)$"),
    voter: str = Form(..., min_length=1, max_length=50)
):
    votes[candidate] += 1
    # 按票数降序排序
    # sorted 返回新列表，key 指定排序依据
    # lambda x: x[1] 取 (name, count) 的第二个元素（count）
    # reverse=True 表示降序
    ranking = sorted(votes.items(), key=lambda x: x[1], reverse=True)
    return {
        "message": f"{voter} 投票给 {candidate}",
        "ranking": ranking
    }
\`\`\`

**测试：**

\`\`\`bash
curl -X POST http://localhost:8000/vote -d "candidate=alice" -d "voter=张三"
curl -X POST http://localhost:8000/vote -d "candidate=alice" -d "voter=李四"
curl -X POST http://localhost:8000/vote -d "candidate=bob" -d "voter=王五"
\`\`\`

### 实验 2：创建一个"订阅 API"（表单列表）

**目标**：练习表单列表字段。

**要求**：
- 接收 \`email\` 和 \`topics\`（订阅主题列表）
- 主题至少选 1 个

\`\`\`python
from fastapi import FastAPI, Form, HTTPException

app = FastAPI()

subscriptions = []

@app.post("/subscribe")
def subscribe(
    email: str = Form(..., pattern=r"^[\\w.-]+@[\\w.-]+\\.\\w+$"),
    topics: list[str] = Form(..., min_length=1)
):
    subscription = {
        "email": email,
        "topics": topics,
        "topic_count": len(topics)
    }
    subscriptions.append(subscription)
    return {
        "message": "订阅成功",
        "email": email,
        "topics": topics
    }
\`\`\`

**测试：**

\`\`\`bash
curl -X POST http://localhost:8000/subscribe \\
  -d "email=alice@example.com" \\
  -d "topics=技术" \\
  -d "topics=设计" \\
  -d "topics=产品"
\`\`\`

### 实验 3：创建"订单提交 API"（表单 + 文件混合）

**目标**：练习表单和文件同时提交。

**要求**：
- 表单字段：\`customer_name\`、\`phone\`、\`address\`
- 文件字段：\`voucher\`（购物凭证图片，可选）

\`\`\`python
from fastapi import FastAPI, Form, File, UploadFile

app = FastAPI()

@app.post("/orders")
async def submit_order(
    customer_name: str = Form(..., min_length=2),
    phone: str = Form(..., pattern=r"^\\d{11}$"),
    address: str = Form(..., min_length=5),
    voucher: UploadFile | None = File(None)
):
    result = {
        "customer": customer_name,
        "phone": phone,
        "address": address
    }
    # 如果上传了凭证
    if voucher:
        contents = await voucher.read()
        result["voucher"] = {
            "filename": voucher.filename,
            "size": len(contents)
        }
    return result
\`\`\`

**测试（带凭证）：**

\`\`\`bash
curl -X POST http://localhost:8000/orders \\
  -F "customer_name=张三" \\
  -F "phone=13800138000" \\
  -F "address=北京市朝阳区" \\
  -F "voucher=@payment.jpg"
\`\`\`

**要点总结：**

1. \`Form()\` 用于接收表单数据，\`Content-Type\` 是 \`application/x-www-form-urlencoded\` 或 \`multipart/form-data\`。
2. 表单参数必须用 \`Form()\` 声明，不能用普通类型注解。
3. \`Form()\` 支持 \`min_length\`、\`max_length\`、\`pattern\`、\`ge\`/\`le\` 等校验。
4. \`Form()\` 可以和路径参数、查询参数混用，但不能和 JSON \`BaseModel\` 混用。
5. \`Form()\` + \`File()\` 可以同时接收文本和文件。
6. 表单列表通过重复 key 实现（\`-d "tags=a" -d "tags=b"\`）。
7. 表单适合传统 HTML 表单、文件上传、对接老系统等场景。
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

## 生活类比：文件上传就像寄包裹

把文件上传想象成"去邮局寄包裹"：

- **JSON / 表单文本字段** → 你在快递单上写的文字（收件人、地址、备注）
- **文件上传** → 你要寄的实物包裹（衣服、书、电子产品）

寄包裹的特点：
- 包裹有大有小（小到一张照片几 KB，大到一部电影几个 GB）
- 包裹里装的是实物（二进制数据），不能像文字那样写在快递单上
- 邮局会按包裹类型处理（图片、视频、文档各有各的 MIME 类型）
- 大包裹要分批搬运（分块读取，避免一次性占满内存）

而 \`UploadFile\` 就是 FastAPI 提供的"包裹接收窗口"——它给你一个文件对象，里面有：
- \`filename\` → 包裹上的"寄件人标注的名称"（可被伪造）
- \`content_type\` → 包裹类型标签（如"图片"、"文档"）
- \`file\` → 包裹里的实物（文件流）
- \`size\` → 包裹重量（字节数）

理解了这个类比，后面的文件上传 API 就很好懂了——你只是在"收包裹并处理"。

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
# File(...) 中的 ... 表示必填，等价于 Ellipsis
# bytes 类型提示 FastAPI 接收文件并把整个内容读入内存为 bytes
# 注意：bytes 类型只能拿到文件内容，拿不到文件名、类型等元数据
# 如需元数据，应使用 UploadFile 类型（下一个示例）
def upload_bytes(file: bytes = File(...)):
    # file 是文件全部内容的 bytes
    # 整个文件已读入内存，对于 1GB 文件会占用 1GB 内存
    # len(bytes) 返回字节数，即文件大小
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
    # UploadFile 是 FastAPI 推荐的文件接收方式
    # 文件先存内存 buffer（2MB 上限），超出自动写临时文件
    # 相比 bytes 类型，UploadFile 不会一次性占满内存
    # 返回文件的所有属性
    return {
        # "filename": file.filename, → 原始文件名
        # filename 是客户端上传时的原始文件名（含扩展名）
        # 注意：客户端可以伪造，不能完全信任，存盘前应重命名
        "filename": file.filename,
        # "content_type": file.content_type, → MIME 类型
        # content_type 是客户端声明的 MIME 类型（如 image/jpeg）
        # 同样可被伪造，重要场景应校验文件魔数
        "content_type": file.content_type,
        # "size": file.size, → 文件大小（字节）
        # size 是文件的字节大小，FastAPI 新版支持
        # 可在校验阶段就拒绝过大的文件，避免读取整个文件
        "size": file.size,
        # "headers": dict(file.headers), → 头信息
        # headers 是该文件部分的 HTTP 头（multipart 中的部分头）
        # 包含 Content-Disposition、Content-Type 等
        # dict() 把 Headers 对象转成普通字典，便于 JSON 序列化
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
# async def 声明这是协程函数，运行在事件循环中
# 在 async 函数里用 await 调用其他协程，避免阻塞事件循环
async def upload_async(file: UploadFile = File(...)):
    # 异步读取文件内容
    # await file.read() 返回 bytes
    # await 会暂停当前协程，让出事件循环给其他请求
    # 等 I/O 完成后再恢复执行，避免一个慢文件读取卡住整个服务
    # 注意：在 async def 里不要用 file.file.read()（同步阻塞）
    # 同步阻塞会卡住事件循环，影响其他请求的并发处理
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
