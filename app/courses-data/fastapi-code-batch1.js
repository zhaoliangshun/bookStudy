// =============================================================
// FastAPI 代码详解 - 第 1 批：快速入门（4 章）
// -------------------------------------------------------------
// 本批章节：
//   fc-install:    安装与第一个 API
//   fc-path:       路径参数
//   fc-query-body: 查询参数与请求体
//   fc-docs:       自动文档与类型提示
//
// 编写原则：demo 驱动，重点在代码注释里讲解，少废话
// =============================================================

export const chapters = [
  {
    id: "fc-install",
    group: "快速入门",
    icon: "🚀",
    title: "安装与第一个 API",
    content: `# 安装与第一个 API

## Demo 1：安装

\`\`\`bash
# 一条命令安装 FastAPI + Uvicorn（带标准依赖，含热重载等开发工具）
pip install "fastapi[standard]"

# 上面等价于：
# pip install fastapi
# pip install "uvicorn[standard]"
\`\`\`

## Demo 2：Hello World

\`\`\`python
# main.py —— 你的第一个 FastAPI 应用
from fastapi import FastAPI  # 导入 FastAPI 类

# 创建应用实例，参数会显示在自动生成的文档页面上
app = FastAPI(
    title="我的 API",       # 文档标题
    description="第一个 FastAPI 应用",  # 文档描述
    version="1.0.0",        # 版本号
)

# @app.get("/") 装饰器含义：
# - get：只处理 GET 请求（读数据用 GET，创建用 POST，更新用 PUT/PATCH，删除用 DELETE）
# - "/"：匹配根路径 http://localhost:8000/
@app.get("/")
def hello():
    # 返回字典，FastAPI 自动转成 JSON 响应
    # Content-Type 也会自动设为 application/json
    return {"message": "Hello World"}
\`\`\`

## Demo 3：启动服务

\`\`\`bash
# 启动命令：uvicorn 文件名:应用变量名
# main:app → main.py 里的 app 变量
# --reload 表示代码改动后自动重启（仅开发环境用）
uvicorn main:app --reload

# 启动后访问：
# http://localhost:8000        → 返回 {"message":"Hello World"}
# http://localhost:8000/docs   → 自动生成的 Swagger 文档（可在线调 API）
# http://localhost:8000/redoc  → 自动生成的 ReDoc 文档（只读风格）
\`\`\`

## Demo 4：多个路由

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

# 根路径
@app.get("/")
def root():
    return {"msg": "首页"}

# /hello 路径 —— 路由就是 URL 路径，你想加几个就加几个
@app.get("/hello")
def hello():
    return {"msg": "你好"}

# /bye 路径 —— 每个路由对应一个函数，函数名可以随便取
@app.get("/bye")
def say_bye():
    return {"msg": "再见"}

# 不同 HTTP 方法也可以绑定到同一个路径
@app.post("/data")   # POST 请求 → 创建数据
def create_data():
    return {"action": "创建"}

@app.put("/data")    # PUT 请求 → 更新数据
def update_data():
    return {"action": "更新"}

@app.delete("/data") # DELETE 请求 → 删除数据
def delete_data():
    return {"action": "删除"}
\`\`\`

## Demo 5：理解装饰器

\`\`\`python
# 装饰器本质：@app.get("/") 等价于 app.get("/")(函数名)
# 它告诉 FastAPI："当用户访问 / 路径时，调用这个函数"

# 这两段代码完全等价：
# 写法一（装饰器）：
@app.get("/items")
def get_items():
    return {"items": []}

# 写法二（等价写法，不用装饰器）：
def get_items():
    return {"items": []}
app.get("/items")(get_items)  # 手动注册路由
\`\`\`

## 小结

| 要点 | 说明 |
|------|------|
| FastAPI() | 创建应用实例 |
| @app.get("/") | 注册 GET 路由 |
| uvicorn | 启动 ASGI 服务器 |
| /docs | 自动生成的交互式文档 |
| 返回值 | 字典自动转 JSON |`
  },

  {
    id: "fc-path",
    group: "快速入门",
    icon: "🔗",
    title: "路径参数",
    content: `# 路径参数

## 什么是路径参数

路径参数是 URL 路径中的动态部分，比如 \`/users/123\` 中的 \`123\`。

## Demo 1：基本路径参数

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI

# 创建应用实例
app = FastAPI()

# {item_id} 是路径参数，花括号里的名字要和函数参数名一致
# 访问 /items/42 → item_id = "42"（字符串）
@app.get("/items/{item_id}")
def read_item(item_id):
    # 参数 item_id 没有类型注解，所以是字符串类型
    # 默认路径参数是字符串类型
    return {"item_id": item_id}

# 测试：访问 /items/hello → {"item_id":"hello"}
# 测试：访问 /items/99   → {"item_id":"99"}  注意：是字符串 "99"，不是数字 99
\`\`\`

## Demo 2：类型声明（自动转换）

\`\`\`python
# 给路径参数加类型注解，FastAPI 会自动转换类型
@app.get("/items/{item_id}")
def read_item(item_id: int):  # 声明 item_id 是 int 类型
    # FastAPI 会：
    # 1. 把 URL 中的字符串 "42" 转成整数 42
    # 2. 如果传的不是数字（如 /items/abc），自动返回 422 错误
    return {"item_id": item_id, "type": type(item_id).__name__}

# 测试：/items/42   → {"item_id":42,"type":"int"}
# 测试：/items/abc  → HTTP 422 校验错误（自动的，不需要写任何 if 判断）
\`\`\`

## Demo 3：多个路径参数

\`\`\`python
# 多个路径参数用 / 分隔
@app.get("/users/{user_id}/posts/{post_id}")
def get_user_post(user_id: int, post_id: int):
    # 访问 /users/1/posts/100
    return {
        "user_id": user_id,   # 1
        "post_id": post_id,   # 100
    }
\`\`\`

## Demo 4：路径参数顺序陷阱

\`\`\`python
# ⚠️ 固定路径必须写在动态路径前面，否则会被动态路径"吃掉"

# 正确写法：固定路径在前
@app.get("/users/me")           # 1. 先匹配固定路径
def get_current_user():
    return {"user": "当前用户"}

@app.get("/users/{user_id}")    # 2. 再匹配动态路径
def get_user(user_id: int):
    return {"user_id": user_id}

# 如果反过来写：
# @app.get("/users/{user_id}")  # 先注册这个，"me" 会被当成 user_id > 报错
# @app.get("/users/me")         # 这个永远不会被匹配到
\`\`\`

## Demo 5：枚举路径参数

\`\`\`python
# 导入 Enum，Python 标准库的枚举类，用于定义一组固定取值
from enum import Enum

# 定义一个枚举类型，限制参数只能是这几个值
# 继承 str 让枚举值也能当字符串用（JSON 序列化时是字符串）
class Color(str, Enum):
    RED = "red"      # 枚举成员，值为 "red"
    GREEN = "green"
    BLUE = "blue"

# 参数类型写成 Color，FastAPI 会限制只能传这三个值之一
@app.get("/color/{color}")
def get_color(color: Color):
    # 参数 color: Color 路径参数会被解析为 Color 枚举成员
    # color 是 Color 枚举成员，不是普通字符串
    if color == Color.RED:
        return {"msg": "红色", "hex": "#FF0000"}
    elif color == Color.GREEN:
        return {"msg": "绿色", "hex": "#00FF00"}
    return {"msg": "蓝色", "hex": "#0000FF"}

# 测试：
# /color/red   → {"msg":"红色","hex":"#FF0000"}
# /color/hello → 422 错误（不在枚举里）
\`\`\`

## Demo 6：路径参数 + 文件路径

\`\`\`python
# FastAPI 支持路径参数中含有 / 的情况（通过 :path 标记）
@app.get("/files/{file_path:path}")
def read_file(file_path: str):
    # :path 标记让参数能匹配包含 / 的完整路径
    return {"file_path": file_path}

# 测试：/files/home/user/data.txt
# → {"file_path":"home/user/data.txt"}
# 不加 :path 的话，上面的 URL 会被解析为多个路径段
\`\`\`

## 小结

| 技巧 | 说明 |
|------|------|
| {param} | 声明路径参数，名必须和函数参数一致 |
| param: int | 类型注解自动转换+校验 |
| 固定路径在前 | 防止动态路径"吃掉"固定路径 |
| Enum | 限制参数只能取特定值 |
| :path | 让参数匹配完整路径（含 /） |`
  },

  {
    id: "fc-query-body",
    group: "快速入门",
    icon: "📦",
    title: "查询参数与请求体",
    content: `# 查询参数与请求体

## 查询参数 vs 请求体

- **查询参数**：URL 中 ? 后面的部分，如 \`/items?page=1&size=10\`
- **请求体**：POST/PUT 请求中 body 携带的数据，通常是 JSON

## Demo 1：查询参数基础

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

# 函数参数不在路径中 → 自动变成查询参数
# 访问 /items?page=1&size=10
@app.get("/items")
def list_items(page: int = 1, size: int = 10):
    # page=1, size=10 是默认值 → 都是可选参数
    # 如果函数参数没有默认值 → 必填参数
    return {"page": page, "size": size}

# 测试：
# /items              → {"page":1,"size":10}  （使用默认值）
# /items?page=2       → {"page":2,"size":10}  （部分覆盖默认值）
# /items?size=5       → {"page":1,"size":5}
# /items?page=3&size=20 → {"page":3,"size":20}
\`\`\`

## Demo 2：必填与可选查询参数

\`\`\`python
@app.get("/search")
def search(
    keyword: str,           # 没有默认值 → 必填参数
    page: int = 1,          # 有默认值 → 可选参数
    sort: str = "created",  # 有默认值 → 可选参数
):
    return {
        "keyword": keyword,
        "page": page,
        "sort": sort,
    }

# 测试：
# /search?keyword=python               → 正常
# /search?keyword=python&page=2         → 正常
# /search?keyword=python&sort=popular   → 正常
# /search                              → 422 错误（缺少 keyword）
\`\`\`

## Demo 3：可选参数用 Optional

\`\`\`python
from typing import Optional

@app.get("/users")
def get_users(
    name: Optional[str] = None,  # 可选字符串，默认 None（不传就是不筛选）
    age: Optional[int] = None,   # 可选整数，默认 None
    active: bool = True,         # 布尔类型，默认 True
):
    # 构建查询条件
    result = {"active": active}
    if name is not None:
        result["name"] = name
    if age is not None:
        result["age"] = age
    return result

# 测试：
# /users          → {"active":true}
# /users?name=张三 → {"active":true,"name":"张三"}
# /users?active=false  → {"active":false}  bool 值传 "true"/"false"/"1"/"0"/"yes"/"no"
\`\`\`

## Demo 4：请求体（POST JSON）

\`\`\`python
# 导入 BaseModel，Pydantic 的基础模型类
# Pydantic 是 FastAPI 自带的，不需要额外安装
from pydantic import BaseModel

# 定义请求体模型 —— 用 Pydantic 的 BaseModel
# 这个类有双重作用：1. 定义数据结构  2. 自动校验数据
class Item(BaseModel):
    name: str           # 必填字段（无默认值）
    price: float        # 必填字段
    description: str | None = None  # 可选字段，默认 None（str | None 表示可以是字符串或 None）
    tax: float | None = None        # 可选字段

# 参数 item: Item 类型是 BaseModel 子类 → 自动从请求体读取
@app.post("/items")
def create_item(item: Item):
    # item 是 Item 实例，可以用 .属性 访问字段
    # FastAPI 自动做了：
    # 1. 读取请求体 JSON
    # 2. 校验字段类型（name 必须是 str，price 必须是 float）
    # 3. 缺失必填字段 → 422 错误
    return {
        "name": item.name,
        "price": item.price,
        "description": item.description,
    }
\`\`\`

## Demo 5：请求体 + 路径参数 + 查询参数 混用

\`\`\`python
@app.put("/items/{item_id}")  # 路径参数
def update_item(
    item_id: int,              # 路径参数
    item: Item,                # 请求体（BaseModel 类型）
    q: str | None = None,      # 查询参数（不在路径中，也不是 BaseModel）
    force: bool = False,       # 查询参数
):
    # FastAPI 自动识别参数来源：
    # - 在路径模板中 → 路径参数
    # - 是 BaseModel 子类 → 请求体
    # - 其他基本类型 → 查询参数
    return {
        "item_id": item_id,
        "query": q,
        "force": force,
        "item": item.dict(),  # dict() 把 Pydantic 模型转成字典
    }
\`\`\`

## Demo 6：嵌套请求体

\`\`\`python
# 导入 List，typing 模块的类型注解工具（Python 3.9+ 也可以直接用 list[str]）
from typing import List

# 地址模型（嵌套子模型）
class Address(BaseModel):
    city: str               # 城市，必填
    street: str             # 街道，必填
    zip_code: str | None = None  # 邮编，可选

# 用户模型（包含嵌套模型）
class User(BaseModel):
    name: str
    age: int
    address: Address           # 嵌套模型（字段类型是另一个 BaseModel）
    tags: List[str] = []       # 字符串列表，默认空列表
    scores: dict[str, float] = {}  # 字典，键是字符串，值是浮点数

# 参数 user: User 嵌套模型，请求体 JSON 也要嵌套
@app.post("/users")
def create_user(user: User):
    return {
        "name": user.name,
        "city": user.address.city,    # 嵌套访问：用点号逐层取
        "tags": user.tags,
        # 计算平均分：sum 求和，if user.scores else 0 防止除以 0
        "avg_score": sum(user.scores.values()) / len(user.scores) if user.scores else 0,
    }

# 请求体示例：
# {
#   "name": "张三",
#   "age": 25,
#   "address": {"city": "北京", "street": "长安街"},
#   "tags": ["python", "fastapi"],
#   "scores": {"math": 90, "english": 85}
# }
\`\`\`

## 小结

| 参数来源 | 判断规则 | 示例 |
|----------|---------|------|
| 路径参数 | 在路径模板中 | \`/items/{item_id}\` |
| 查询参数 | 基本类型，不在路径中 | \`page: int = 1\` |
| 请求体 | Pydantic BaseModel 类型 | \`item: Item\` |`
  },

  {
    id: "fc-docs",
    group: "快速入门",
    icon: "📖",
    title: "自动文档与类型提示",
    content: `# 自动文档与类型提示

## FastAPI 的"魔法"：类型提示

FastAPI 的核心能力来自 Python 类型提示（Type Hints）。你写类型注解，FastAPI 自动做校验、转换、文档生成。

## Demo 1：类型提示基础

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI
# 导入 date，Python 标准库的日期类
from datetime import date

# 创建应用实例
app = FastAPI()

@app.get("/greet")
def greet(name: str, age: int, birthday: date):
    # 参数 name: str 查询参数，字符串
    # 参数 age: int 查询参数，整数（FastAPI 自动转换）
    # 参数 birthday: date 查询参数，日期（FastAPI 自动解析 "2024-01-01" 为 date 对象）
    # FastAPI 根据类型注解自动：
    # 1. name: str  → 校验字符串 (URL 传进来的本来就是字符串)
    # 2. age: int   → 自动把 "25" 转成 25，不是数字 → 422 错误
    # 3. birthday: date → 自动把 "2024-01-01" 转成 date 对象
    return {
        "name": name,
        "age": age,
        "year_born": birthday.year,  # date 对象可以直接取 year/month/day
    }

# 测试：/greet?name=张三&age=25&birthday=2000-06-15
# → {"name":"张三","age":25,"year_born":2000}
\`\`\`

## Demo 2：响应模型（控制输出）

\`\`\`python
# 导入 BaseModel
from pydantic import BaseModel

# 输入模型：接收用户数据
class UserIn(BaseModel):
    username: str
    password: str       # 密码只在输入时有
    email: str

# 输出模型：返回给用户的数据（隐藏密码）
class UserOut(BaseModel):
    username: str
    email: str
    # 注意：没有 password 字段 → 不会返回密码

# response_model=UserOut 声明响应用这个模型
# FastAPI 会自动过滤掉 UserOut 里没有的字段（即使返回值里有）
@app.post("/users/", response_model=UserOut)
def create_user(user: UserIn):
    # 参数 user: UserIn 请求体模型
    # 虽然接收了 password，但 response_model 会过滤掉它
    return user  # FastAPI 自动只返回 UserOut 里定义的字段

# 请求：{"username":"zhangsan","password":"123456","email":"zs@test.com"}
# 响应：{"username":"zhangsan","email":"zs@test.com"}  ← 密码被过滤了！
\`\`\`

## Demo 3：文档描述（元数据）

\`\`\`python
# 导入 BaseModel 和 Field
# Field 用于给字段加约束（描述、长度、范围、示例等）
from pydantic import BaseModel, Field

class Product(BaseModel):
    # Field() 给字段加约束和元数据
    name: str = Field(
        description="商品名称",       # 字段描述（显示在文档中）
        min_length=1,                 # 最短长度
        max_length=100,               # 最长长度
        example="iPhone 15",          # 文档中的示例值
    )
    price: float = Field(
        description="商品价格",
        gt=0,                         # greater than：价格必须 > 0
        example=5999.00,
    )
    tags: list[str] = Field(
        default=[],                   # 默认空列表
        description="商品标签",
        example=["手机", "数码"],
    )

# response_model=Product 响应也用这个模型
@app.post("/products", response_model=Product)
def create_product(
    product: Product,
    # 参数 product: Product 请求体
):
    """
    创建新商品

    - **name**: 商品名称，1-100 个字符
    - **price**: 商品价格，必须大于 0
    - **tags**: 可选标签列表
    """
    # 函数文档字符串（docstring）会显示在 /docs 页面中
    # 支持 Markdown 格式
    return product
\`\`\`

## Demo 4：标签与分组

\`\`\`python
# 用 tags 参数给路由分组，文档中会按标签分类展示
@app.get("/users/", tags=["用户管理"])
def list_users():
    return {"users": []}

@app.post("/users/", tags=["用户管理"])
def create_user():
    return {"msg": "创建成功"}

@app.get("/products/", tags=["商品管理"])
def list_products():
    return {"products": []}

# 在 /docs 页面中，这些路由会按 "用户管理" 和 "商品管理" 分组显示
\`\`\`

## Demo 5：deprecated 标记

\`\`\`python
@app.get("/old-api", deprecated=True)  # 标记为已废弃
def old_api():
    # /docs 文档中会显示灰色标记，提醒用户不要使用
    return {"msg": "这个接口即将废弃，请使用 /new-api"}

@app.get("/new-api")
def new_api():
    return {"msg": "新接口"}
\`\`\`

## Demo 6：文档完整示例

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(
    title="电商 API",           # 文档标题
    description="一个简单的电商系统 API",  # 文档描述
    version="2.0.0",            # 版本号
    # 联系信息
    contact={
        "name": "开发团队",
        "email": "dev@example.com",
    },
    # 许可证
    license_info={
        "name": "MIT",
    },
)

class Order(BaseModel):
    """订单模型"""
    product_name: str = Field(description="商品名称", example="iPhone")
    quantity: int = Field(description="数量", gt=0, example=1)
    price: float = Field(description="单价", gt=0, example=5999.0)

@app.post("/orders", tags=["订单"], summary="创建订单")
def create_order(order: Order):
    """
    创建新订单。

    需要提供商品名称、数量和单价。
    """
    total = order.quantity * order.price
    return {"total": total}

# 访问 http://localhost:8000/docs 即可看到完整的交互式文档
# 可以直接在文档页面点击 "Try it out" 测试 API
\`\`\`

## 小结

| 功能 | 说明 |
|------|------|
| 类型注解 | 自动校验 + 转换 + 生成文档 |
| response_model | 过滤输出字段，隐藏敏感信息 |
| Field() | 给字段加描述、校验规则、示例 |
| tags | 文档中按分组展示路由 |
| /docs | Swagger 交互式文档 |
| /redoc | ReDoc 只读文档 |`
  },
];