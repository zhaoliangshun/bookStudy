// =============================================================
// FastAPI 应用开发实战教程 - 第 3 批章节（请求体与表单 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-body        : 请求体 Pydantic Model
//   fa-form        : 表单数据 Form
//   fa-file-upload : 文件上传 UploadFile
//   fa-body-fields : Body 字段与 Field
// =============================================================

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

## 什么是请求体

HTTP 请求由请求行、请求头、请求体三部分组成。**请求体（body）**是请求里携带数据的部分，常用于 POST/PUT/PATCH 等需要提交数据的场景。

GET 请求一般没有 body（参数走 URL query），POST 创建资源时通常把数据放 body。body 的格式由 \`Content-Type\` 头决定：

- \`application/json\` —— JSON，最常用
- \`application/x-www-form-urlencoded\` —— 表单
- \`multipart/form-data\` —— 文件上传
- \`application/xml\` —— XML（少见）

FastAPI 最擅长的是 JSON body。用 Pydantic 的 \`BaseModel\` 定义结构，FastAPI 自动解析、校验、生成文档。

## 用 Pydantic BaseModel 定义请求体

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义一个数据模型：用户创建请求
# 定义 Pydantic 数据模型 UserCreate，继承 BaseModel
class UserCreate(BaseModel):
    username: str          # 必填，用户名
    email: str             # 必填，邮箱
    # 字段 age，类型: int | None，默认值: None # 可选，年龄
    age: int | None = None # 可选，年龄
    # 字段 is_active，类型: bool，默认值: True # 可选，默认 True
    is_active: bool = True # 可选，默认 True

# 定义 POST 路由：访问 /users 时触发
@app.post("/users")
# 定义函数 create_user，参数: user: UserCreate
def create_user(user: UserCreate):
    # user 是 UserCreate 实例，字段已校验过
    # FastAPI 把 JSON body 解析成 UserCreate，自动校验类型
    # 返回 {
    return {
        # "username": user.username,
        "username": user.username,
        # "email": user.email,
        "email": user.email,
        # "age": user.age,
        "age": user.age,
        # "is_active": user.is_active
        "is_active": user.is_active
    # }
    }
\`\`\`

请求示例：

\`\`\`bash
# 发送 POST 请求
curl -X POST http://localhost:8000/users \\
  # -H "Content-Type: application/json" \\
  -H "Content-Type: application/json" \\
  # -d '{"username": "alice", "email": "a@x.com", "age
  -d '{"username": "alice", "email": "a@x.com", "age": 30}'
\`\`\`

发生了什么：

1. FastAPI 看到 \`user: UserCreate\` 参数，类型是 BaseModel 子类，识别为请求体。
2. 读请求 body，解析 JSON。
3. 用解析的数据实例化 \`UserCreate\`，做类型校验。
4. 校验失败返回 422 + 错误详情；成功则把实例传给 \`user\`。

## 字段必选 vs 可选

规则和查询参数一样：**有默认值 = 可选，无默认值 = 必填**。

\`\`\`python
# 定义 Pydantic 数据模型 UserCreate，继承 BaseModel
class UserCreate(BaseModel):
    username: str           # 无默认值 → 必填
    email: str              # 无默认值 → 必填
    age: int | None = None  # 有默认值 None → 可选
    bio: str = ""           # 有默认值 → 可选，默认空串
    is_admin: bool = False  # 可选，默认 False
\`\`\`

提交时漏掉必填字段返回 422：

\`\`\`json
// 提交 {"username": "alice"}（漏了 email）
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

## 自动类型转换与校验

Pydantic 会尝试做合理的类型转换：

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
# Pydantic 把 "199.5" 转成 float 199.5，"true" 转成 bool True
# 这是宽松模式（默认），不是严格模式
\`\`\`

但传不能转换的值会报错：

- \`price: "abc"\` → 422（字符串转不了 float）
- \`in_stock: "maybe"\` → 422（转不了 bool）
- \`price: null\` 且无默认值 → 422（null 不是 float）

## 字段类型

BaseModel 字段支持丰富的类型：

### 基础类型

\`\`\`python
# 定义 Pydantic 数据模型 Item，继承 BaseModel
class Item(BaseModel):
    # 字段 name，类型: str
    name: str
    # 字段 price，类型: float
    price: float
    # 字段 quantity，类型: int
    quantity: int
    # 字段 is_available，类型: bool
    is_available: bool
\`\`\`

### 集合类型

\`\`\`python
# 从 typing 导入 List, Dict
from typing import List, Dict

# 定义 Pydantic 数据模型 Order，继承 BaseModel
class Order(BaseModel):
    # 列表
    item_ids: list[int]            # Python 3.9+ 推荐
    tags: List[str]               # 老写法
    # 字典
    metadata: dict[str, str]      # Python 3.9+
    extra: Dict[str, Any]         # 任意键值
    # 元组（定长定类型）
    coords: tuple[float, float]   # (1.0, 2.0)
    # 集合
    unique_tags: set[str]         # 自动去重
\`\`\`

### 嵌套模型

模型字段可以是另一个模型，形成嵌套结构：

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
    address: Address        # 嵌套模型
    # 字段 addresses，类型: list[Address] # 嵌套列表
    addresses: list[Address] # 嵌套列表

# 提交 JSON：
# {
#   "username": "alice",
#   "address": {"city": "北京", "street": "长安街", "zip_code": "100000"},
#   "addresses": [
#     {"city": "北京", "street": "...", "zip_code": "..."},
#     {"city": "上海", "street": "...", "zip_code": "..."}
#   ]
# }
\`\`\`

嵌套模型层层校验，任何一层出错都返回 422，\`loc\` 会标明哪一层（如 \`["body", "address", "city"]\`）。

### Optional / Union 多类型

\`\`\`python
# 从 typing 导入 Optional, Union
from typing import Optional, Union

# 定义 Pydantic 数据模型 Item，继承 BaseModel
class Item(BaseModel):
    # 可以是 int 或 None
    # 字段 priority，类型: int | None，默认值: None
    priority: int | None = None
    # 可以是 int 或 str
    # 字段 id，类型: int | str
    id: int | str
    # 老写法
    # 字段 tag，类型: Optional[str]，默认值: None
    tag: Optional[str] = None
    # 字段 raw，类型: Union[int, str, None]，默认值: None
    raw: Union[int, str, None] = None
\`\`\`

## 实战：创建用户接口

把上面串起来，写一个完整的创建用户接口：

\`\`\`python
# 从 fastapi 导入 FastAPI, HTTPException
from fastapi import FastAPI, HTTPException
# 从 pydantic 导入 BaseModel
from pydantic import BaseModel

# 创建 FastAPI 应用实例
app = FastAPI()

# 模拟数据库
# 定义字典 users_db
users_db = {}

# 定义 Pydantic 数据模型 Address，继承 BaseModel
class Address(BaseModel):
    # 字段 city，类型: str
    city: str
    # 字段 zip_code，类型: str | None，默认值: None
    zip_code: str | None = None

# 定义 Pydantic 数据模型 UserCreate，继承 BaseModel
class UserCreate(BaseModel):
    # 字段 username，类型: str
    username: str
    # 字段 email，类型: str
    email: str
    # 字段 age，类型: int | None，默认值: None
    age: int | None = None
    # 字段 is_active，类型: bool，默认值: True
    is_active: bool = True
    address: Address | None = None   # 嵌套模型可选
    tags: list[str] = []             # 默认空列表

# 定义 POST 路由：访问 /users 时触发
@app.post("/users", status_code=201)
# 定义函数 create_user，参数: user: UserCreate
def create_user(user: UserCreate):
    # 1. 业务校验：用户名不能重复
    # 条件判断：如果 user.username in users_db
    if user.username in users_db:
        # 抛出 HTTPException 异常: status_code=400, detail="用户名已存在"
        raise HTTPException(status_code=400, detail="用户名已存在")
    # 2. 存入数据库
    # users_db[user.username] = user
    users_db[user.username] = user
    # 3. 返回创建结果
    # 返回 {"username": user.username, "email": user.email, "age": user.age}
    return {"username": user.username, "email": user.email, "age": user.age}
\`\`\`

请求：

\`\`\`bash
# 发送 POST 请求
curl -X POST http://localhost:8000/users \\
  # -H "Content-Type: application/json" \\
  -H "Content-Type: application/json" \\
  # -d '{
  -d '{
    # "username": "alice",
    "username": "alice",
    # "email": "alice@example.com",
    "email": "alice@example.com",
    # "age": 28,
    "age": 28,
    # "address": {"city": "北京", "zip_code": "100000"},
    "address": {"city": "北京", "zip_code": "100000"},
    # "tags": ["vip", "active"]
    "tags": ["vip", "active"]
  # }'
  }'
\`\`\`

这个接口的好处：

- 字段类型和必填规则用模型定义，不写一行校验代码。
- 嵌套模型 \`address\` 自动校验。
- Swagger 文档自动展示完整结构（含嵌套）。
- 业务代码只关心业务逻辑（查重、存储）。

## body 是只读副本

FastAPI 给路由的 \`user\` 是模型实例，可以直接访问字段。如果想改字段再存：

\`\`\`python
# 定义 POST 路由：访问 /users 时触发
@app.post("/users")
# 定义函数 create_user，参数: user: UserCreate
def create_user(user: UserCreate):
    # 模型默认可变，可以改字段
    user.is_active = True  # 强制设为 True
    # 用 model_dump() 转成 dict 存库
    # users_db[user.username] = user.model_dump()
    users_db[user.username] = user.model_dump()
    # 返回 user
    return user
\`\`\`

\`model_dump()\` 是 Pydantic v2 的方法（v1 叫 \`.dict()\`），把模型转成字典，常用于存数据库前序列化。

## 易错点小结

| 易错点 | 说明 | 解决 |
|--------|------|------|
| 忘 Content-Type | body 不解析，全当 None | 加 \`-H "Content-Type: application/json"\` |
| 必填忘传 | 漏字段 422 | 看清哪些字段无默认值 |
| 嵌套结构错 | 内层缺字段 422，loc 标层级 | 按 loc 定位 |
| 默认值用可变对象 | \`tags: list = []\` 共享默认值 | 用 \`None\` + 函数内初始化，或 Pydantic 自动 copy |
| v1/v2 方法混 | \`.dict()\` v2 弃用 | v2 用 \`model_dump()\` |

⚠️ 关于默认值可变对象的提醒：Pydantic 会自动深拷贝默认值，所以 \`tags: list[str] = []\` 在 BaseModel 里是安全的（不像普通 Python 函数默认值会共享）。但普通函数默认值里别用可变对象。

---

## 本章小结

| 要点 | 说明 |
|------|------|
| 请求体 | HTTP body 携带的数据，常用 JSON |
| 定义 | Pydantic BaseModel 子类 |
| 必填/可选 | 无默认值必填，有默认值可选 |
| 类型转换 | "1" → 1 等宽松转换 |
| 嵌套模型 | 字段类型是另一个 BaseModel |
| 集合类型 | list/dict/tuple/set |
| 多类型 | Optional / Union / X \| Y |
| 序列化 | model_dump() / model_dump_json() |
| 自动文档 | Swagger 显示完整结构 |

下一章看表单数据——HTML 表单提交、登录表单这种场景，body 格式不是 JSON 而是表单编码。`
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

## 表单和 JSON 的区别

上一章我们用 JSON body 提交数据。但 Web 世界里还有另一种历史悠久的 body 格式——表单（form）。

HTML 的 \`<form>\` 标签提交时，默认用 \`application/x-www-form-urlencoded\` 格式编码 body：

- 数据是键值对，用 \`&\` 分隔，键值用 \`=\` 连接，特殊字符 URL 编码。
- 整个 body 是一坨字符串：\`username=alice&password=123456\`。
- \`Content-Type: application/x-www-form-urlencoded\`。

对比 JSON body：

| 维度 | JSON | 表单 (urlencoded) |
|------|------|------------------|
| Content-Type | application/json | application/x-www-form-urlencoded |
| 格式 | 嵌套结构、有类型 | 扁平键值对，全是字符串 |
| 嵌套支持 | 天然支持 | 难（要 \`a[b]=1\` 这种约定） |
| 文件上传 | 不支持 | 用 multipart/form-data |
| 典型来源 | 前端 fetch/axios | HTML <form> 提交 |

为什么还要用表单？

1. **HTML 表单**：浏览器原生 \`<form>\` 提交就是表单格式，老系统对接用表单更自然。
2. **OAuth/登录**：很多登录、token 接口规范要求表单格式（如 OAuth2 password grant）。
3. **兼容旧系统**：老客户端不支持 JSON。

## Form() 接收表单字段

FastAPI 用 \`Form()\` 接收表单字段，用法类似 \`Query()\`：

\`\`\`python
# 从 fastapi 导入 FastAPI, Form
from fastapi import FastAPI, Form

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /login 时触发
@app.post("/login")
# def login(
def login(
    username: str = Form(...),     # 必填表单字段
    password: str = Form(...)      # 必填表单字段
# ):
):
    # 提交表单：username=alice&password=123456
    # Content-Type: application/x-www-form-urlencoded
    # 条件判断：如果 username == "alice" and password == "123456"
    if username == "alice" and password == "123456":
        # 返回 {"msg": "登录成功", "user": username}
        return {"msg": "登录成功", "user": username}
    # 返回 {"msg": "用户名或密码错误"}
    return {"msg": "用户名或密码错误"}
\`\`\`

请求：

\`\`\`bash
# 发送 POST 请求
curl -X POST http://localhost:8000/login \\
  # -d "username=alice&password=123456"
  -d "username=alice&password=123456"
# curl 默认用 urlencoded，不用手动加 Content-Type
\`\`\`

或在 HTML 表单：

\`\`\`html
# <form action="/login" method="post">
<form action="/login" method="post">
  # <input name="username" />
  <input name="username" />
  # <input name="password" type="password" />
  <input name="password" type="password" />
  # <button>登录</button>
  <button>登录</button>
# </form>
</form>
\`\`\`

\`Form()\` 的第一参数也是默认值：\`...\` 表示必填，\`None\` 或具体值表示可选/默认。

## 不能和 JSON Body 混用

⚠️ 重要规则：**一个接口的 body 只能有一种格式**。要么 JSON（Pydantic 模型），要么表单（Form），要么 multipart（文件），不能混。

\`\`\`python
# ❌ 错误：不能同时声明 Pydantic 模型和 Form
# 定义 POST 路由：访问 /items 时触发
@app.post("/items")
# 定义函数 create_item，参数: item: Item, user: str = Form(...)
def create_item(item: Item, user: str = Form(...)):
    # item 是 JSON body，user 是表单 body
    # 一个请求不能同时是 JSON 和表单，会 422
    # ...
    ...

# ✅ 正确：要么全 JSON
# 定义 POST 路由：访问 /items 时触发
@app.post("/items")
# 定义函数 create_item，参数: item: Item
def create_item(item: Item):
    # ...
    ...

# ✅ 正确：要么全表单
# 定义 POST 路由：访问 /items 时触发
@app.post("/items")
# 定义函数 create_item，参数: name: str = Form(...), price: float = Form(...)
def create_item(name: str = Form(...), price: float = Form(...)):
    # ...
    ...
\`\`\`

原因是 HTTP body 是一份流数据，解析方式由 Content-Type 决定。一个请求的 Content-Type 只能是一种，body 也只能被解析成一种格式。FastAPI 在启动时会校验，发现混用会抛 \`AssertionError\`。

## multipart/form-data 用于文件上传

\`application/x-www-form-urlencoded\` 不能传文件（二进制数据）。传文件要用 \`multipart/form-data\`，每个字段用分隔符隔开：

\`\`\`
------boundary
Content-Disposition: form-data; name="username"

alice
------boundary
Content-Disposition: form-data; name="avatar"; filename="photo.jpg"
Content-Type: image/jpeg

<二进制数据>
------boundary--
\`\`\`

FastAPI 的 \`File()\` 和 \`UploadFile\` 自动按 multipart 解析。表单字段和文件可以一起用 multipart 提交：

\`\`\`python
# 从 fastapi 导入 FastAPI, Form, UploadFile
from fastapi import FastAPI, Form, UploadFile

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /upload 时触发
@app.post("/upload")
# async def upload(
async def upload(
    name: str = Form(...),           # 表单字段
    avatar: UploadFile = None         # 文件
# ):
):
    # name 和 avatar 都在 multipart body 里
    # 定义变量 contents，赋值为 await avatar.read() if avatar else None
    contents = await avatar.read() if avatar else None
    # 返回 {"name": name, "filename": avatar.filename if avatar else None}
    return {"name": name, "filename": avatar.filename if avatar else None}
\`\`\`

## Form vs Body 区别

FastAPI 还有 \`Body()\`，区别：

- \`Form()\` —— 解析为表单格式（urlencoded/multipart）。
- \`Body()\` —— 解析为 JSON（或其它 body 类型）。声明单个字段时，FastAPI 期望 body 是 \`{"key": value}\` 结构。
- Pydantic 模型 —— 等同于 \`Body()\`，解析为 JSON。

简单说：

| 声明方式 | body 格式 |
|----------|-----------|
| Pydantic 模型 / \`Body()\` | JSON |
| \`Form()\` | urlencoded 表单 |
| \`File()\` / \`UploadFile\` | multipart 表单 |

## 什么时候用 Form

| 场景 | 用什么 |
|------|--------|
| 前端 SPA 提交 JSON | Pydantic 模型 |
| HTML <form> 提交 | Form() |
| OAuth2 登录接口 | Form()（规范要求） |
| 上传文件 + 表单字段 | Form() + File()/UploadFile |
| 老系统对接 | 看对方格式 |

大多数现代 API 用 JSON 即可，Form 主要用于 HTML 表单和某些规范要求。

## 实战：登录表单

写一个完整的登录接口，用表单接收用户名密码：

\`\`\`python
# 从 fastapi 导入 FastAPI, Form, HTTPException
from fastapi import FastAPI, Form, HTTPException

# 创建 FastAPI 应用实例
app = FastAPI()

# 模拟用户库
# 定义字典 fake_users
fake_users = {
    # "alice": {"password": "secret123", "role": "admin"
    "alice": {"password": "secret123", "role": "admin"},
    # "bob": {"password": "bobpass", "role": "user"}
    "bob": {"password": "bobpass", "role": "user"}
# }
}

# 定义 POST 路由：访问 /login 时触发
@app.post("/login")
# def login(
def login(
    # 字段 username，类型: str，默认值: Form(..., min_length=3, description="用户名"),
    username: str = Form(..., min_length=3, description="用户名"),
    # 字段 password，类型: str，默认值: Form(..., min_length=6, description="密码"),
    password: str = Form(..., min_length=6, description="密码"),
    # 字段 remember，类型: bool，默认值: Form(False, description="记住我")
    remember: bool = Form(False, description="记住我")
# ):
):
    # 1. 查用户
    # 定义变量 user，赋值为 fake_users.get(username)
    user = fake_users.get(username)
    # 2. 校验密码
    # 条件判断：如果 not user or user["password"] != password
    if not user or user["password"] != password:
        # 抛出 HTTPException 异常: status_code=401, detail="用户名或密码错误"
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    # 3. 返回登录信息（实际应返回 token）
    # 返回 {
    return {
        # "msg": "登录成功",
        "msg": "登录成功",
        # "user": username,
        "user": username,
        # "role": user["role"],
        "role": user["role"],
        # "remember": remember
        "remember": remember
    # }
    }
\`\`\`

请求：

\`\`\`bash
# 发送 POST 请求
curl -X POST http://localhost:8000/login \\
  # -d "username=alice&password=secret123&remember=tru
  -d "username=alice&password=secret123&remember=true"
\`\`\`

返回：

\`\`\`json
{"msg": "登录成功", "user": "alice", "role": "admin", "remember": true}
\`\`\`

## OAuth2PasswordRequestForm

FastAPI 内置了 OAuth2 登录表单模型，省得自己声明 \`username\`/\`password\`：

\`\`\`python
# 从 fastapi.security 导入 OAuth2PasswordRequestForm
from fastapi.security import OAuth2PasswordRequestForm

# 定义 POST 路由：访问 /token 时触发
@app.post("/token")
# 定义函数 login，参数: form: OAuth2PasswordRequestForm = Depends()
def login(form: OAuth2PasswordRequestForm = Depends()):
    # form.username, form.password, form.scope, form.grant_type...
    # 这些是 OAuth2 规范要求的字段
    # 返回 {"access_token": "xxx", "token_type": "bearer"}
    return {"access_token": "xxx", "token_type": "bearer"}
\`\`\`

这是 FastAPI 帮你封装好的标准 OAuth2 表单，专门用于密码模式登录。后面认证章节会详细讲。

## 易错点小结

| 易错点 | 说明 | 解决 |
|--------|------|------|
| JSON 和 Form 混用 | 一个接口不能两种 body | 选一种 |
| 忘 Form() 默认值 | \`def f(name: str = Form(...))\` 写成 \`name: str\` | Form 字段必须用 Form() |
| 文件用 urlencoded | 上传文件用错格式 | 文件用 multipart + File/UploadFile |
| 表单字段名错 | HTML 里 name 属性要和 Form() 参数名一致 | 检查 name 属性 |
| bool 表单值 | "false"/"0"/"" 都算 False | 记住转换规则 |

---

## 本章小结

| 要点 | 说明 |
|------|------|
| 表单格式 | application/x-www-form-urlencoded |
| Form() | 接收表单字段 |
| 不能混用 | 一个接口一种 body 格式 |
| multipart | 文件上传用 multipart/form-data |
| Form vs Body | Form 解析表单，Body 解析 JSON |
| 适用场景 | HTML 表单、OAuth2、老系统 |
| OAuth2 表单 | OAuth2PasswordRequestForm 内置 |

下一章专门讲文件上传——UploadFile 怎么用、大文件怎么处理、文件怎么校验。`
  },

  // ============================================================
  // 第 11 章：文件上传 UploadFile
  // ============================================================
  {
    id: "fa-file-upload",
    group: "请求体与表单",
    icon: "📁",
    title: "文件上传 UploadFile",
    content: `# 文件上传 UploadFile

## 两种接收文件的方式

FastAPI 接收上传文件有两种方式：

- **\`File()\`**：接收小文件，整个文件读进内存成 \`bytes\`。简单，但大文件会撑爆内存。
- **\`UploadFile\`**：接收大文件，文件先存到磁盘临时文件（SpooledTemporaryFile），流式读写。推荐用法。

| 方式 | 内存占用 | 适合 | 大小 |
|------|----------|------|------|
| \`File(bytes)\` | 高（全进内存） | 小文件 | 几 MB 以内 |
| \`UploadFile\` | 低（存磁盘临时文件） | 大文件 | 任意 |

## File() 接收小文件

\`\`\`python
# 从 fastapi 导入 FastAPI, File
from fastapi import FastAPI, File

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /upload-small 时触发
@app.post("/upload-small")
# 定义异步函数 upload_small，参数: file: bytes = File(...)
async def upload_small(file: bytes = File(...)):
    # file 是 bytes，整个文件内容
    # 适合几 KB ~ 几 MB 的小文件
    # 返回 {
    return {
        # "size": len(file),
        "size": len(file),
        "preview": file[:50]  # 前 50 字节预览
    # }
    }
\`\`\`

请求（用 -F 上传文件，curl 自动用 multipart）：

\`\`\`bash
# 发送 POST 请求
curl -X POST http://localhost:8000/upload-small \\
  # -F "file=@photo.jpg"
  -F "file=@photo.jpg"
\`\`\`

\`File(bytes)\` 把文件内容全读成 bytes，简单但占内存。生产慎用，文件一大就 OOM。

## UploadFile 接收大文件（推荐）

\`UploadFile\` 是 Starlette 提供的类，文件先写到一个 SpooledTemporaryFile（默认 1MB 以下在内存，超过就转磁盘临时文件），可以流式读取：

\`\`\`python
# 从 fastapi 导入 FastAPI, UploadFile
from fastapi import FastAPI, UploadFile

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /upload 时触发
@app.post("/upload")
# 定义异步函数 upload，参数: file: UploadFile
async def upload(file: UploadFile):
    # UploadFile 的属性
    # 返回 {
    return {
        "filename": file.filename,      # 原始文件名（用户上传的名字）
        # "content_type": file.content_type, # MIME 类型，如 ima
        "content_type": file.content_type, # MIME 类型，如 image/jpeg
        "size": file.size                # 文件大小（字节）
    # }
    }
\`\`\`

注意：用了 \`UploadFile\` 的接口建议用 \`async def\`，因为它的读取方法是异步的（要 await）。

## UploadFile 的属性和方法

\`\`\`python
# 定义 POST 路由：访问 /upload 时触发
@app.post("/upload")
# 定义异步函数 upload，参数: file: UploadFile
async def upload(file: UploadFile):
    # 属性
    name = file.filename          # 文件名（str | None）
    ctype = file.content_type    # MIME 类型（str | None）
    size = file.size             # 大小（int | None，Starlette 0.36+）

    # 异步读取内容（返回 bytes）
    contents = await file.read()  # 一次读完
    await file.seek(0)            # 读完后指针在末尾，seek(0) 回到开头

    # 异步写入（写到另一个 UploadFile 或目标）
    # await file.write(b"data")

    # 同步读写（在 def 路由里用）
    # file.file  # 底层 SpooledTemporaryFile，可同步操作

    await file.close()  # 关闭，释放临时文件
    # 返回 {"name": name, "size": size, "content_type": ctype}
    return {"name": name, "size": size, "content_type": ctype}
\`\`\`

异步方法（\`async def\` 路由用）：\`await file.read()\`、\`await file.write()\`、\`await file.seek()\`、\`await file.close()\`。

同步方法（\`def\` 路由用）：通过 \`file.file\` 拿到底层文件对象，用普通同步 I/O。

## 保存到磁盘

上传后通常要存到服务器磁盘或对象存储：

\`\`\`python
# 导入 shutil 模块
import shutil
# 从 pathlib 导入 Path
from pathlib import Path
# 从 fastapi 导入 FastAPI, UploadFile
from fastapi import FastAPI, UploadFile

# 创建 FastAPI 应用实例
app = FastAPI()
# 定义变量 UPLOAD_DIR，赋值为 Path("uploads")
UPLOAD_DIR = Path("uploads")
# 调用 UPLOAD_DIR.mkdir()
UPLOAD_DIR.mkdir(exist_ok=True)

# 定义 POST 路由：访问 /upload 时触发
@app.post("/upload")
# 定义异步函数 upload，参数: file: UploadFile
async def upload(file: UploadFile):
    # 1. 校验文件类型
    # 条件判断：如果 not file.content_type.startswith("image/")
    if not file.content_type.startswith("image/"):
        # 返回 {"error": "只能上传图片"}
        return {"error": "只能上传图片"}

    # 2. 生成存储路径（用原始文件名，实际应重命名防冲突/防注入）
    # 定义变量 dest，赋值为 UPLOAD_DIR / file.filename
    dest = UPLOAD_DIR / file.filename

    # 3. 流式复制到磁盘（不用 read 全进内存）
    # 使用上下文管理器 dest.open("wb")，赋值为 f
    with dest.open("wb") as f:
        # file.file 是底层文件对象，shutil.copyfileobj 流式复制
        # 调用 shutil.copyfileobj()
        shutil.copyfileobj(file.file, f)

    # await file.close()
    await file.close()
    # 返回 {"filename": file.filename, "saved_to": str(dest)}
    return {"filename": file.filename, "saved_to": str(dest)}
\`\`\`

⚠️ 安全提醒：**不要直接用用户传的文件名**存盘，会有路径穿越攻击（如 \`../../etc/passwd\`）和重名覆盖。应该用 \`uuid\` 重命名，或校验文件名只含安全字符。

## 多文件上传

用 \`list[UploadFile]\` 接收多个文件：

\`\`\`python
# 从 fastapi 导入 FastAPI, UploadFile
from fastapi import FastAPI, UploadFile

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由：访问 /upload-multiple 时触发
@app.post("/upload-multiple")
# 定义异步函数 upload_multiple，参数: files: list[UploadFile]
async def upload_multiple(files: list[UploadFile]):
    # 定义列表 results
    results = []
    # 遍历 files，取 f
    for f in files:
        # 逐个处理
        # 定义变量 contents，赋值为 await f.read()
        contents = await f.read()
        # results.append({
        results.append({
            # "filename": f.filename,
            "filename": f.filename,
            # "size": len(contents),
            "size": len(contents),
            # "content_type": f.content_type
            "content_type": f.content_type
        # })
        })
        # await f.close()
        await f.close()
    # 返回 {"count": len(files), "files": results}
    return {"count": len(files), "files": results}
\`\`\`

请求（多个 -F，同名字段）：

\`\`\`bash
# 发送 POST 请求
curl -X POST http://localhost:8000/upload-multiple \\
  # -F "files=@a.jpg" \\
  -F "files=@a.jpg" \\
  # -F "files=@b.png" \\
  -F "files=@b.png" \\
  # -F "files=@c.gif"
  -F "files=@c.gif"
\`\`\`

HTML 表单用 \`multiple\`：

\`\`\`html
# <input type="file" name="files" multiple />
<input type="file" name="files" multiple />
\`\`\`

## 文件大小限制

FastAPI 默认不限制文件大小。生产中要自己加限制，防止超大文件耗尽磁盘/内存：

\`\`\`python
# 定义 POST 路由：访问 /upload 时触发
@app.post("/upload")
# 定义异步函数 upload，参数: file: UploadFile
async def upload(file: UploadFile):
    # 读内容后判断大小
    # 定义变量 contents，赋值为 await file.read()
    contents = await file.read()
    MAX_SIZE = 5 * 1024 * 1024  # 5MB
    # 条件判断：如果 len(contents) > MAX_SIZE
    if len(contents) > MAX_SIZE:
        # 返回 {"error": "文件超过 5MB 限制"}
        return {"error": "文件超过 5MB 限制"}
    # 处理 ...
    # await file.close()
    await file.close()
    # 返回 {"size": len(contents)}
    return {"size": len(contents)}
\`\`\`

更优雅的方式：用中间件在请求阶段就拦掉超大 body（基于 \`Content-Length\` 头），避免读完才知道超大。

## 文件类型校验

不能只信 \`content_type\`（用户可伪造），生产中要校验文件内容的 magic number（文件头）：

\`\`\`python
# 简单校验扩展名（弱校验，可被绕过）
# 定义字典 ALLOWED_EXT
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".gif"}

# 定义 POST 路由：访问 /upload 时触发
@app.post("/upload")
# 定义异步函数 upload，参数: file: UploadFile
async def upload(file: UploadFile):
    # 定义变量 ext，赋值为 Path(file.filename).suffix.lower()
    ext = Path(file.filename).suffix.lower()
    # 条件判断：如果 ext not in ALLOWED_EXT
    if ext not in ALLOWED_EXT:
        # 返回 {"error": f"不支持的格式 {ext}"}
        return {"error": f"不支持的格式 {ext}"}
    # ...
    ...

# 严格校验：读文件头判断真实类型（用 python-magic 库）
# import magic
# mime = magic.from_buffer(await file.read(2048), mime=True)
\`\`\`

## StreamingResponse 返回文件

除了上传，下载文件时用 \`StreamingResponse\` 流式返回（避免大文件全进内存）：

\`\`\`python
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入 StreamingResponse
from fastapi.responses import StreamingResponse

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 GET 路由：访问 /download/{filename} 时触发
@app.get("/download/{filename}")
# 定义函数 download，参数: filename: str
def download(filename: str):
    # 定义变量 path，赋值为 Path("uploads") / filename
    path = Path("uploads") / filename
    # 条件判断：如果 not path.exists()
    if not path.exists():
        # 返回 {"error": "文件不存在"}
        return {"error": "文件不存在"}

    # 定义函数 iter_file，参数: 
    def iter_file():
        # 分块读取，流式返回
        # 使用上下文管理器 path.open("rb")，赋值为 f
        with path.open("rb") as f:
            while chunk := f.read(64 * 1024):  # 64KB 一块
                # 生成值: chunk
                yield chunk

    # 返回 StreamingResponse(
    return StreamingResponse(
        # 调用 iter_file()
        iter_file(),
        # 定义变量 media_type，赋值为 "application/octet-stream",
        media_type="application/octet-stream",
        # 定义字典 headers
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    # )
    )
\`\`\`

\`StreamingResponse\` 接收一个生成器，逐块 yield 数据。大文件下载不占内存，客户端边接收边写入。

## 实战：图片上传接口

完整例子，含校验、重命名、存储：

\`\`\`python
# 导入 uuid 模块
import uuid
# 从 pathlib 导入 Path
from pathlib import Path
# 从 fastapi 导入 FastAPI, UploadFile, HTTPException
from fastapi import FastAPI, UploadFile, HTTPException

# 创建 FastAPI 应用实例
app = FastAPI()
# 定义变量 UPLOAD_DIR，赋值为 Path("uploads")
UPLOAD_DIR = Path("uploads")
# 调用 UPLOAD_DIR.mkdir()
UPLOAD_DIR.mkdir(exist_ok=True)

# 定义字典 ALLOWED_TYPES
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif"}
MAX_SIZE = 5 * 1024 * 1024  # 5MB

# 定义 POST 路由：访问 /upload-image 时触发
@app.post("/upload-image")
# 定义异步函数 upload_image，参数: file: UploadFile
async def upload_image(file: UploadFile):
    # 1. 校验类型
    # 条件判断：如果 file.content_type not in ALLOWED_TYPES
    if file.content_type not in ALLOWED_TYPES:
        # 抛出 HTTPException 异常: 400, f"不支持的类型: {file.content_type}"
        raise HTTPException(400, f"不支持的类型: {file.content_type}")

    # 2. 读内容并校验大小
    # 定义变量 contents，赋值为 await file.read()
    contents = await file.read()
    # 条件判断：如果 len(contents) > MAX_SIZE
    if len(contents) > MAX_SIZE:
        # 抛出 HTTPException 异常: 400, "文件超过 5MB"
        raise HTTPException(400, "文件超过 5MB")

    # 3. 生成安全文件名（uuid + 原扩展名）
    # 定义变量 ext，赋值为 Path(file.filename).suffix.lower()
    ext = Path(file.filename).suffix.lower()
    # 定义变量 safe_name，赋值为 f"{uuid.uuid4().hex}{ext}"
    safe_name = f"{uuid.uuid4().hex}{ext}"
    # 定义变量 dest，赋值为 UPLOAD_DIR / safe_name
    dest = UPLOAD_DIR / safe_name

    # 4. 写入磁盘
    # 调用 dest.write_bytes()
    dest.write_bytes(contents)
    # await file.close()
    await file.close()

    # 返回 {
    return {
        # "original_name": file.filename,
        "original_name": file.filename,
        # "saved_name": safe_name,
        "saved_name": safe_name,
        # "size": len(contents),
        "size": len(contents),
        # "url": f"/uploads/{safe_name}"
        "url": f"/uploads/{safe_name}"
    # }
    }
\`\`\`

## 易错点小结

| 易错点 | 说明 | 解决 |
|--------|------|------|
| 小文件用 File 大文件用 UploadFile | 大文件 File() 会 OOM | 大文件用 UploadFile |
| 忘 await | \`file.read()\` 没 await 拿到协程对象 | async 路由里用 await |
| 文件名直接存盘 | 路径穿越/重名 | uuid 重命名 |
| 只信 content_type | 可伪造 | 校验文件头 magic number |
| 不限大小 | 大文件耗资源 | 中间件或读后判断 |
| read 后忘 seek | 再次 read 拿不到内容 | seek(0) 回开头 |

---

## 本章小结

| 要点 | 说明 |
|------|------|
| File(bytes) | 小文件，全进内存 |
| UploadFile | 大文件，磁盘临时文件，流式 |
| UploadFile 属性 | filename/content_type/size |
| 异步方法 | await read/write/seek/close |
| 多文件 | list[UploadFile] |
| 安全存储 | uuid 重命名，校验类型 |
| 大小限制 | 自己加，FastAPI 默认不限 |
| 下载文件 | StreamingResponse 流式返回 |

下一章看 Field()——给 BaseModel 字段加约束和文档，让模型校验更精细。`
  },

  // ============================================================
  // 第 12 章：Body 字段与 Field
  // ============================================================
  {
    id: "fa-body-fields",
    group: "请求体与表单",
    icon: "🏷️",
    title: "Body 字段与 Field",
    content: `# Body 字段与 Field

## Field() 是什么

上一章用 BaseModel 定义请求体，字段只有类型和默认值。但实际业务里字段要更多约束：

- 用户名长度 3~20
- 密码至少 8 位，含字母和数字
- 价格必须 > 0
- 字段要描述（给文档看）

Pydantic 的 \`Field()\` 用来给 BaseModel 字段加这些约束和元数据，作用类似 \`Query()\`/\`Path()\` 之于参数。

## 基本用法

\`Field()\` 用作字段的默认值（和 \`Query()\` 用作参数默认值类似）：

\`\`\`python
# 从 pydantic 导入 BaseModel, Field
from pydantic import BaseModel, Field

# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # username：必填（用 ... 表示），长度 3~20
    # 字段 username，类型: str，默认值: Field(..., min_length=3, max_length=20)
    username: str = Field(..., min_length=3, max_length=20)
    # age：可选，默认 None，范围 0~150
    # 字段 age，类型: int | None，默认值: Field(None, ge=0, le=150)
    age: int | None = Field(None, ge=0, le=150)
    # score：默认 0.0，> 0
    # 字段 score，类型: float，默认值: Field(0.0, gt=0)
    score: float = Field(0.0, gt=0)
\`\`\`

\`Field()\` 第一参数是默认值：

- \`...\`（Ellipsis）→ 必填
- \`None\` → 可选，默认 None
- 具体值 → 用该值作默认

## 字段约束规则

### 字符串约束

| 参数 | 作用 |
|------|------|
| \`min_length\` | 最小长度 |
| \`max_length\` | 最大长度 |
| \`pattern\` | 正则（v2，v1 叫 \`regex\`） |

\`\`\`python
# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # 用户名 3~20 字符，字母数字下划线
    # 字段 username，类型: str，默认值: Field(..., min_length=3, max_length=20, pattern="^[a-zA-Z0-9_]+$")
    username: str = Field(..., min_length=3, max_length=20, pattern="^[a-zA-Z0-9_]+$")
    # 手机号 11 位数字
    # 字段 phone，类型: str，默认值: Field(..., pattern=r"^\\d{11}$")
    phone: str = Field(..., pattern=r"^\\d{11}$")
\`\`\`

⚠️ 注意正则里的反斜杠：在 Python 字符串里 \`\\d\` 才是 \`\\d\`（一个反斜杠+d）。建议用原始字符串 \`r"^\\d{11}$"\` 避免转义混乱。

### 数字约束

| 参数 | 作用 |
|------|------|
| \`ge\` | ≥ |
| \`gt\` | > |
| \`le\` | ≤ |
| \`lt\` | < |
| \`multiple_of\` | 倍数 |

\`\`\`python
# 定义 Pydantic 数据模型 Product，继承 BaseModel
class Product(BaseModel):
    # 字段 price，类型: float，默认值: Field(..., gt=0, description="价格，必须大于 0")
    price: float = Field(..., gt=0, description="价格，必须大于 0")
    # 字段 stock，类型: int，默认值: Field(0, ge=0, description="库存，非负")
    stock: int = Field(0, ge=0, description="库存，非负")
    # 字段 discount，类型: float，默认值: Field(0.0, ge=0, le=1, description="折扣 0~1")
    discount: float = Field(0.0, ge=0, le=1, description="折扣 0~1")
\`\`\`

### 列表约束

| 参数 | 作用 |
|------|------|
| \`min_length\` / \`min_items\` | 最少元素数 |
| \`max_length\` / \`max_items\` | 最多元素数 |

\`\`\`python
# 定义 Pydantic 数据模型 Order，继承 BaseModel
class Order(BaseModel):
    # 至少 1 个商品，最多 50 个
    # 字段 items，类型: list[str]，默认值: Field(..., min_length=1, max_length=50)
    items: list[str] = Field(..., min_length=1, max_length=50)
\`\`\`

## 字段描述 description

给字段加说明，会出现在 Swagger 文档里：

\`\`\`python
# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # 字段 username，类型: str，默认值: Field(
    username: str = Field(
        # ...,
        ...,
        # 定义变量 title，赋值为 "用户名",
        title="用户名",
        # 定义变量 description，赋值为 "登录用户名，3~20 个字符，只能字母数字下划线",
        description="登录用户名，3~20 个字符，只能字母数字下划线",
        # 定义变量 min_length，赋值为 3,
        min_length=3,
        # 定义变量 max_length，赋值为 20
        max_length=20
    # )
    )
\`\`\`

- \`title\`：字段短标题
- \`description\`：详细说明（支持 Markdown）

Swagger 里这个字段会显示标题和说明，前端一看就懂。

## 字段示例 example

\`example\` 给字段一个示例值，Swagger 里"Try it out"会预填：

\`\`\`python
# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # 字段 username，类型: str，默认值: Field(
    username: str = Field(
        # "alice",
        "alice",
        # 定义变量 description，赋值为 "用户名",
        description="用户名",
        # 定义变量 example，赋值为 "bob_smith"
        example="bob_smith"
    # )
    )
    # 字段 email，类型: str，默认值: Field(
    email: str = Field(
        # ...,
        ...,
        # 定义变量 description，赋值为 "邮箱",
        description="邮箱",
        examples=["a@x.com", "b@y.com"]  # 多个示例
    # )
    )
\`\`\`

\`example\` 是单个示例，\`examples\`（复数）是多个示例列表。

## JSON Schema 生成

Pydantic 模型能生成 JSON Schema（OpenAPI 用的格式），Field() 的约束和元数据都体现在 schema 里：

\`\`\`python
# 调用 print()
print(User.model_json_schema())
# {
#   "type": "object",
#   "properties": {
#     "username": {
#       "type": "string",
#       "title": "用户名",
#       "description": "...",
#       "minLength": 3,
#       "maxLength": 20,
#       "pattern": "^[a-zA-Z0-9_]+$"
#     }
#   },
#   "required": ["username"]
# }
\`\`\`

FastAPI 拿这个 schema 生成 \`/openapi.json\`，Swagger 据此渲染文档。所以 Field() 的约束既做校验又做文档，一处定义两处用。

## 嵌套模型字段

嵌套模型也能加 Field 约束（主要是描述和列表长度）：

\`\`\`python
# 定义 Pydantic 数据模型 Address，继承 BaseModel
class Address(BaseModel):
    # 字段 city，类型: str，默认值: Field(..., min_length=1, description="城市")
    city: str = Field(..., min_length=1, description="城市")
    # 字段 zip_code，类型: str，默认值: Field(..., pattern=r"^\\d{6}$", description="邮编 6 位")
    zip_code: str = Field(..., pattern=r"^\\d{6}$", description="邮编 6 位")

# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # 字段 name，类型: str
    name: str
    # 嵌套模型字段，加描述和列表约束
    # 字段 addresses，类型: list[Address]，默认值: Field(
    addresses: list[Address] = Field(
        # 定义变量 default_factory，赋值为 list,
        default_factory=list,
        # 定义变量 description，赋值为 "用户地址列表，最多 5 个",
        description="用户地址列表，最多 5 个",
        # 定义变量 max_length，赋值为 5
        max_length=5
    # )
    )
\`\`\`

注意用 \`default_factory=list\` 而不是 \`=[]\` 生成默认空列表——这是 Pydantic 推荐的可变默认值写法（避免共享默认值）。

## List / Dict 字段

\`\`\`python
# 从 typing 导入 Dict, Any
from typing import Dict, Any

# 定义 Pydantic 数据模型 Config，继承 BaseModel
class Config(BaseModel):
    # 字符串列表
    # 字段 tags，类型: list[str]，默认值: Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    # 整数列表，带约束
    # 字段 scores，类型: list[int]，默认值: Field(default_factory=list, min_length=1)
    scores: list[int] = Field(default_factory=list, min_length=1)
    # 字典：键字符串，值任意
    # 字段 metadata，类型: dict[str, Any]，默认值: Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)
    # 定长元组
    # 字段 coords，类型: tuple[float, float]，默认值: (0.0, 0.0)
    coords: tuple[float, float] = (0.0, 0.0)
\`\`\`

\`default_factory\` 接收一个工厂函数（如 \`list\`、\`dict\），每次实例化时调用生成新对象，避免可变默认值共享问题。

## extra 字段控制

默认情况下，Pydantic 模型允许请求 body 里多传字段（额外字段会被忽略或保留）。可以配置：

\`\`\`python
# 从 pydantic 导入 BaseModel, ConfigDict
from pydantic import BaseModel, ConfigDict

# 定义 Pydantic 数据模型 User，继承 BaseModel
class User(BaseModel):
    # Pydantic v2 配置
    model_config = ConfigDict(extra="forbid")  # 禁止额外字段

    # 字段 username，类型: str
    username: str
    # 字段 email，类型: str
    email: str

# 提交 {"username": "a", "email": "b", "foo": "bar"}
# 因为 extra="forbid"，foo 是额外字段 → 422 错误
\`\`\`

\`extra\` 的三个值：

| 值 | 行为 |
|----|------|
| \`"ignore"\` | 忽略额外字段（默认行为之一） |
| \`"allow"\` | 保留额外字段在模型里 |
| \`"forbid"\` | 有额外字段就报错 |

生产中常用 \`"forbid"\` 防止前端传多余字段（可能是拼写错误或攻击尝试），让接口契约更严格。

## 完整示例

把 Field 的各种用法串起来：

\`\`\`python
# 从 pydantic 导入 BaseModel, Field, ConfigDict
from pydantic import BaseModel, Field, ConfigDict

# 定义 Pydantic 数据模型 ProductCreate，继承 BaseModel
class ProductCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")  # 禁止额外字段

    # 字段 name，类型: str，默认值: Field(
    name: str = Field(
        # ...,
        ...,
        # 定义变量 min_length，赋值为 1,
        min_length=1,
        # 定义变量 max_length，赋值为 100,
        max_length=100,
        # 定义变量 title，赋值为 "商品名",
        title="商品名",
        # 定义变量 description，赋值为 "商品名称，1~100 字符",
        description="商品名称，1~100 字符",
        # 定义变量 example，赋值为 "苹果手机"
        example="苹果手机"
    # )
    )
    # 字段 price，类型: float，默认值: Field(
    price: float = Field(
        # ...,
        ...,
        # 定义变量 gt，赋值为 0,
        gt=0,
        # 定义变量 le，赋值为 99999,
        le=99999,
        # 定义变量 description，赋值为 "价格，大于 0 且不超过 99999",
        description="价格，大于 0 且不超过 99999",
        # 定义变量 example，赋值为 5999.00
        example=5999.00
    # )
    )
    # 字段 stock，类型: int，默认值: Field(
    stock: int = Field(
        # 0,
        0,
        # 定义变量 ge，赋值为 0,
        ge=0,
        # 定义变量 description，赋值为 "库存，非负整数",
        description="库存，非负整数",
        # 定义变量 example，赋值为 100
        example=100
    # )
    )
    # 字段 tags，类型: list[str]，默认值: Field(
    tags: list[str] = Field(
        # 定义变量 default_factory，赋值为 list,
        default_factory=list,
        # 定义变量 max_length，赋值为 10,
        max_length=10,
        # 定义变量 description，赋值为 "标签，最多 10 个",
        description="标签，最多 10 个",
        # 定义列表 example
        example=["电子", "新品"]
    # )
    )
    # 字段 is_active，类型: bool，默认值: Field(True, description="是否上架")
    is_active: bool = Field(True, description="是否上架")

# 定义 POST 路由：访问 /products 时触发
@app.post("/products")
# 定义函数 create_product，参数: product: ProductCreate
def create_product(product: ProductCreate):
    # 返回 product.model_dump()
    return product.model_dump()
\`\`\`

这个接口的 Swagger 文档会非常丰富：每个字段有标题、说明、示例、约束，前端对接很轻松。校验全自动，业务代码零校验逻辑。

## Field vs Query/Path 的异同

\`Field()\`、\`Query()\`、\`Path()\` 都用 \`...\`/默认值/None 表达必填可选，都支持 ge/le/min_length 等约束。区别：

| 函数 | 用在 | 来源 |
|------|------|------|
| \`Field()\` | BaseModel 字段 | body (JSON) |
| \`Query()\` | 路由函数参数 | URL query |
| \`Path()\` | 路由函数参数 | URL path |
| \`Form()\` | 路由函数参数 | body (表单) |
| \`Header()\` | 路由函数参数 | 请求头 |
| \`Cookie()\` | 路由函数参数 | Cookie |

它们都是 Pydantic 的 \`FieldInfo\` 子类，约束参数通用。

## 易错点小结

| 易错点 | 说明 | 解决 |
|--------|------|------|
| 默认值用可变对象 | \`tags: list = []\` 共享 | 用 default_factory=list |
| 正则反斜杠 | \`"\\d"\` 被转义 | 用 r"" 原始字符串 |
| 忘 ... 表示必填 | \`Field(None)\` 是可选不是必填 | 必填用 \`Field(...)\` |
| extra 默认行为 | 多传字段被忽略 | 需要严格用 extra="forbid" |
| Field 装饰 Query 参数 | Field 只用于模型字段 | 参数用 Query/Path |

---

## 本章小结

| 要点 | 说明 |
|------|------|
| Field() | BaseModel 字段约束 + 元数据 |
| 默认值 | ...必填 / None可选 / 具体值默认 |
| 字符串约束 | min_length/max_length/pattern |
| 数字约束 | ge/gt/le/lt/multiple_of |
| 列表约束 | min_length/max_length |
| 元数据 | title/description/example/examples |
| JSON Schema | Field 约束自动生成 schema |
| 嵌套字段 | 嵌套模型也能加 Field |
| 可变默认值 | 用 default_factory |
| extra 控制 | ignore/allow/forbid |

到这里请求体与表单这块讲完。下一批章节进入 Pydantic 数据校验——深入理解 BaseModel 的类型系统、自定义校验器、模型配置，这是写出健壮 API 的内功。`
  }
];
