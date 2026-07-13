// =============================================================
// FastAPI Demo 详解 - 第 2 批章节（请求与数据 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fl-request-body:   请求体
//   fl-pydantic:       Pydantic 校验
//   fl-response-model: 响应控制
//   fl-form-files:     表单与文件
// =============================================================

export const chapters = [
  {
    id: "fl-request-body",
    group: "请求与数据",
    icon: "📦",
    title: "请求体",
    content: `# 请求体

## 什么是请求体

\`\`\`python
# 请求体：客户端发给服务端的数据，通常在 POST/PUT 请求里
# 对比三种参数：
#   路径参数：/items/42        ← 在 URL 路径里
#   查询参数：?key=value       ← 在 URL 问号后
#   请求体：  JSON 数据         ← 在 HTTP body 里（不在 URL）
#
# 请求体用 POST 发送，比如提交表单、创建资源
# GET 请求一般没有请求体
\`\`\`

## Demo 1：用 Pydantic 模型接收请求体

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI
# 导入 BaseModel，Pydantic 的基础模型类，用于定义数据结构并自动校验
from pydantic import BaseModel

# 创建应用实例
app = FastAPI()

# 第 1 步：定义数据模型（继承 BaseModel）
class Item(BaseModel):
    name: str              # 必填字段
    price: float           # 必填字段
    is_offer: bool = False # 可选字段（有默认值）

# 第 2 步：在函数参数里用这个模型
@app.post("/items")
def create_item(item: Item):
    # 参数 item: Item 表示请求体会被自动解析为 Item 对象
    # FastAPI 自动做的事：
    # 1. 读取请求体的 JSON
    # 2. 按 Item 模型校验字段（类型、必填）
    # 3. 校验失败返回 422
    # 4. 成功则把数据转成 Item 对象，传给 item 参数
    return item  # 直接返回模型，FastAPI 自动转 JSON

# 测试请求（用 curl 或 /docs 页面）：
# curl -X POST http://localhost:8000/items \\
#      -H "Content-Type: application/json" \\
#      -d '{"name": "苹果", "price": 5.5}'
# 返回：{"name":"苹果","price":5.5,"is_offer":false}
\`\`\`

## Demo 2：访问模型字段

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI
# 导入 BaseModel
from pydantic import BaseModel

# 创建应用实例
app = FastAPI()

class Item(BaseModel):
    name: str
    price: float
    quantity: int = 0

@app.post("/items")
def create_item(item: Item):
    # item 是 Item 对象，用点号访问字段
    name = item.name              # 取字段值
    total = item.price * item.quantity  # 直接计算

    # 可以返回任意结构，不一定要返回模型本身
    return {
        "created": True,
        "name": name,
        "total_price": total,
    }
\`\`\`

## Demo 3：请求体 + 路径参数 + 查询参数

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI
# 导入 BaseModel
from pydantic import BaseModel

# 创建应用实例
app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

# 三种参数可以同时出现，FastAPI 自动识别：
# - 在路径 {} 里的 → 路径参数
# - 是 Pydantic 模型的 → 请求体
# - 其他普通类型的 → 查询参数
@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item, q: str | None = None):
    # item_id：路径参数（在路径里）
    # item：请求体（是 BaseModel）
    # q：查询参数（普通类型，不在路径里）
    result = {"item_id": item_id, **item.dict()}
    if q:
        result["q"] = q
    return result

# 请求示例：
# PUT /items/5?q=搜索词
# Body: {"name": "书", "price": 30}
\`\`\`

## Demo 4：嵌套模型

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI
# 导入 BaseModel
from pydantic import BaseModel

# 创建应用实例
app = FastAPI()

# 模型可以嵌套，反映复杂数据结构
class Address(BaseModel):
    city: str
    street: str

class User(BaseModel):
    name: str
    age: int
    address: Address   # 嵌套另一个模型

# 请求体 JSON 也要嵌套
@app.post("/users")
def create_user(user: User):
    # 参数 user: User 是嵌套模型
    # user.address 是 Address 对象
    # 用点号逐层访问
    return {
        "name": user.name,
        "city": user.address.city,
        "street": user.address.street,
    }

# 请求 JSON 示例：
# {
#   "name": "张三",
#   "age": 25,
#   "address": {
#     "city": "北京",
#     "street": "长安街"
#   }
# }
\`\`\`

## Demo 5：列表和字典字段

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI
# 导入 BaseModel
from pydantic import BaseModel

# 创建应用实例
app = FastAPI()

class Article(BaseModel):
    title: str
    # tags 是字符串列表
    tags: list[str] = []
    # metadata 是任意键值对（字典）
    metadata: dict[str, str] = {}

@app.post("/articles")
def create_article(article: Article):
    return {
        "title": article.title,
        "tag_count": len(article.tags),       # 统计标签数
        "has_meta": len(article.metadata) > 0,  # 是否有元数据
    }

# 请求示例：
# {"title": "学 FastAPI", "tags": ["py", "web"], "metadata": {"author": "我"}}
\`\`\`

## 小结

| 要点 | 写法 |
|------|------|
| 定义模型 | \`class X(BaseModel)\` |
| 接收请求体 | 函数参数用模型类型 |
| 必填/可选 | 有默认值=可选，无=必填 |
| 嵌套 | 模型字段用另一个模型 |

请求体让 API 能接收复杂结构化数据，是 POST/PUT 的核心。`
  },

  {
    id: "fl-pydantic",
    group: "请求与数据",
    icon: "🔧",
    title: "Pydantic 校验",
    content: `# Pydantic 校验

## Pydantic 的作用

\`\`\`python
# Pydantic 是 FastAPI 的数据校验引擎
# 核心思想：用 Python 类型注解定义数据结构，自动校验
#
# 两个能力：
# 1. 校验：进来的数据不对就报错（422）
# 2. 序列化：对象 ↔ JSON 自动转换
#
# 好处：不用手写 if 校验，类型注解写完就生效
\`\`\`

## Demo 1：字段校验器（Field）

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI
# 导入 BaseModel 和 Field
# Field 用于给字段加约束（最小值、最大值、长度等）
from pydantic import BaseModel, Field

# 创建应用实例
app = FastAPI()

class Item(BaseModel):
    name: str = Field(
        min_length=1,        # 最少 1 个字符
        max_length=50,       # 最多 50 个字符
        description="商品名称",  # 显示在 /docs 文档
    )
    price: float = Field(
        gt=0,                # 必须大于 0
        description="价格，必须为正数",
    )
    quantity: int = Field(
        default=0,
        ge=0,                # 大于等于 0
    )

@app.post("/items")
def create_item(item: Item):
    # 参数 item: Item 会被自动校验
    return item

# 常用校验参数：
# 数字：gt(>)、ge(>=)、lt(<)、le(<=)
# 字符串/列表：min_length、max_length
# 都有 description 用于文档说明
\`\`\`

## Demo 2：自定义校验（validator）

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI
# 导入 BaseModel 和 field_validator
# field_validator 是 Pydantic v2 的自定义校验器装饰器（v1 是 validator）
from pydantic import BaseModel, field_validator

# 创建应用实例
app = FastAPI()

class User(BaseModel):
    username: str
    email: str
    age: int

    # @field_validator 装饰器：自定义校验某个字段
    # 参数是要校验的字段名
    @field_validator("username")
    @classmethod  # 必须加 @classmethod，因为校验方法是类方法
    def username_must_alphanumeric(cls, v):
        # cls 是类本身，v 是字段值
        # 校验用户名只能字母数字
        if not v.isalnum():
            raise ValueError("用户名只能包含字母和数字")
        return v  # 校验通过必须返回值

    @field_validator("email")
    @classmethod
    def email_must_have_at(cls, v):
        if "@" not in v:
            raise ValueError("邮箱必须包含 @")
        return v

    @field_validator("age")
    @classmethod
    def age_must_reasonable(cls, v):
        if v < 0 or v > 150:
            raise ValueError("年龄必须在 0~150 之间")
        return v

@app.post("/users")
def create_user(user: User):
    return user

# 校验失败会返回 422，错误信息里包含我们写的提示
\`\`\`

## Demo 3：默认值与可选字段

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI
# 导入 BaseModel
from pydantic import BaseModel

# 创建应用实例
app = FastAPI()

class Product(BaseModel):
    # 三种字段模式：
    name: str                 # 1. 必填：无默认值
    price: float = 0.0        # 2. 有默认值：可选，不传就用默认
    desc: str | None = None   # 3. 可选：明确允许 None

@app.post("/products")
def create_product(p: Product):
    return p

# 请求 {"name": "书"} → price=0.0, desc=None（用默认）
# 请求 {"name": "书", "price": 10, "desc": "好书"} → 全部用传入值
# 请求 {"price": 10} → 422，缺少 name
\`\`\`

## Demo 4：模型方法（dict/json）

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI
# 导入 BaseModel
from pydantic import BaseModel

# 创建应用实例
app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.post("/items")
def create_item(item: Item):
    # Pydantic 模型内置方法：
    d = item.model_dump()        # 转成 dict（v2 写法）
    # 旧版 v1 用 .dict()，已废弃
    j = item.model_dump_json()   # 转成 JSON 字符串

    # 可以修改 dict 后返回
    d["tax"] = d["price"] * 0.1
    return d
\`\`\`

## Demo 5：模型继承复用

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI
# 导入 BaseModel
from pydantic import BaseModel

# 创建应用实例
app = FastAPI()

# 基类：通用字段
class BaseUser(BaseModel):
    username: str
    email: str

# 继承基类，扩展字段
class UserCreate(BaseUser):
    password: str   # 创建时需要密码

class UserOut(BaseUser):
    id: int         # 输出时有 id，但没有密码
    is_active: bool = True

# response_model=UserOut 指定响应模型
@app.post("/users", response_model=UserOut)
def create_user(user: UserCreate):
    # 入参用 UserCreate（含密码）
    # 返回用 UserOut（不含密码），见下一章 response_model
    return {
        "id": 1,
        "username": user.username,
        "email": user.email,
        "is_active": True,
    }
\`\`\`

## Demo 6：示例数据（文档更清晰）

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI
# 导入 BaseModel 和 Field
from pydantic import BaseModel, Field

# 创建应用实例
app = FastAPI()

class Item(BaseModel):
    # model_config 里放 JSON 示例，显示在 /docs 文档
    # model_config 是 Pydantic v2 的配置方式（v1 用 class Config）
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "苹果",
                    "price": 5.5,
                    "quantity": 100,
                }
            ]
        }
    }
    name: str
    price: float = Field(gt=0)
    quantity: int = Field(default=0, ge=0)

@app.post("/items")
def create_item(item: Item):
    return item

# examples 会让 /docs 页面的请求体示例显示这些值
# 用户点 "Try it out" 时自动填入，方便测试
\`\`\`

## 小结

| 能力 | 写法 |
|------|------|
| 字段约束 | \`Field(gt=0, min_length=1)\` |
| 自定义校验 | \`@field_validator\` |
| 转 dict | \`model_dump()\` |
| 转 JSON | \`model_dump_json()\` |
| 模型继承 | \`class B(A)\` |

Pydantic 让数据校验声明式化，**写类型就等于写校验**。`
  },

  {
    id: "fl-response-model",
    group: "请求与数据",
    icon: "📤",
    title: "响应控制",
    content: `# 响应控制

## 为什么要控制响应

\`\`\`python
# 默认情况：FastAPI 把返回值直接转 JSON
# 问题：可能泄露敏感字段（密码）、字段不固定、文档不清晰
#
# 解决：用 response_model 指定响应结构
# FastAPI 会：过滤多余字段、补全文档、保证响应格式一致
\`\`\`

## Demo 1：response_model 过滤字段（重点）

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI
# 导入 BaseModel
from pydantic import BaseModel

# 创建应用实例
app = FastAPI()

# 入参模型：包含密码
class UserIn(BaseModel):
    username: str
    password: str
    email: str

# 出参模型：不含密码
class UserOut(BaseModel):
    id: int
    username: str
    email: str

# response_model=UserOut 告诉 FastAPI：
# 不管你返回什么，只输出 UserOut 定义的字段
@app.post("/users", response_model=UserOut)
def create_user(user: UserIn):
    # 参数 user: UserIn 是请求体，自动校验
    # 实际返回包含 password，但响应会被过滤掉
    return {
        "id": 1,
        "username": user.username,
        "password": user.password,   # 不会出现在响应里！
        "email": user.email,
    }

# 响应：{"id":1, "username":"xx", "email":"xx"}
# password 被自动过滤，安全
\`\`\`

## Demo 2：response_model 用 list

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI
# 导入 BaseModel
from pydantic import BaseModel

# 创建应用实例
app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

# 响应是列表时，用 list[模型] 
# response_model=list[Item] 表示返回 Item 对象的列表
@app.get("/items", response_model=list[Item])
def list_items():
    # 返回列表，每个元素都会按 Item 校验/过滤
    return [
        {"name": "苹果", "price": 5, "extra": "被过滤"},  # extra 没了
        {"name": "香蕉", "price": 3},
    ]

# 响应：[{"name":"苹果","price":5.0}, {"name":"香蕉","price":3.0}]
\`\`\`

## Demo 3：自定义状态码

\`\`\`python
# 导入 FastAPI 类和 status 模块
# status 模块包含所有 HTTP 状态码常量
from fastapi import FastAPI, status
# 导入 BaseModel
from pydantic import BaseModel

# 创建应用实例
app = FastAPI()

class Item(BaseModel):
    name: str

# status_code 指定成功时的 HTTP 状态码
# status.HTTP_201_CREATED = 201（资源创建成功）
@app.post("/items", status_code=status.HTTP_201_CREATED)
def create_item(item: Item):
    return item

# 常用状态码：
# 200 OK          —— 默认，成功
# 201 Created     —— 创建资源成功（POST 常用）
# 204 No Content  —— 成功但无内容返回（DELETE 常用）
# 400 Bad Request —— 请求错误
# 404 Not Found   —— 资源不存在
# 422 Unprocessable —— 校验失败（FastAPI 默认）
\`\`\`

## Demo 4：Response 对象精细控制

\`\`\`python
# 导入 FastAPI 类和 Response 类
from fastapi import FastAPI, Response
# 导入 JSONResponse、PlainTextResponse、HTMLResponse
# JSONResponse 返回 JSON
# PlainTextResponse 返回纯文本
# HTMLResponse 返回 HTML
from fastapi.responses import JSONResponse, PlainTextResponse, HTMLResponse

# 创建应用实例
app = FastAPI()

# 返回 JSONResponse：自定义状态码和响应头
@app.get("/custom")
def custom():
    return JSONResponse(
        content={"msg": "hi"},
        status_code=200,
        headers={"X-Custom-Header": "value"},  # 自定义响应头
    )

# 返回纯文本
# response_class=PlainTextResponse 指定响应类型为纯文本
@app.get("/text", response_class=PlainTextResponse)
def text():
    return "这是纯文本"

# 返回 HTML
# response_class=HTMLResponse 指定响应类型为 HTML
@app.get("/html", response_class=HTMLResponse)
def html():
    return "<h1>你好</h1>"

# 设置 Cookie
@app.get("/set-cookie")
def set_cookie(response: Response):
    # 参数 response: Response 由 FastAPI 自动注入
    # 通过 response.set_cookie 设置
    response.set_cookie(key="token", value="abc123", httponly=True)
    return {"msg": "cookie 已设置"}
\`\`\`

## Demo 5：响应头控制

\`\`\`python
# 导入 FastAPI 类和 Response 类
from fastapi import FastAPI, Response

# 创建应用实例
app = FastAPI()

@app.get("/items")
def get_items(response: Response):
    # 参数 response: Response 由 FastAPI 自动注入
    # response.headers 直接加响应头
    response.headers["X-Total-Count"] = "100"
    response.headers["Cache-Control"] = "no-cache"
    return {"items": []}

# 也可以在 response_model 外用 Response 参数
# 注意：函数里注入 Response，设置的 header 会附加到最终响应
\`\`\`

## Demo 6：直接返回 dict 也行

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI
# 导入 BaseModel
from pydantic import BaseModel

# 创建应用实例
app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

# 不指定 response_model 时，返回啥就响应啥
@app.get("/items/{id}")
def get_item(id: int):
    # 参数 id: int 从路径提取并自动转为整数
    # 直接返回 dict，FastAPI 转 JSON
    return {"id": id, "name": "商品", "price": 10}

# 但推荐用 response_model，好处：
# 1. 文档更准确（/docs 能看到响应结构）
# 2. 防止泄露字段
# 3. 响应格式统一
\`\`\`

## 小结

| 需求 | 写法 |
|------|------|
| 过滤响应字段 | \`response_model=OutModel\` |
| 列表响应 | \`response_model=list[X]\` |
| 自定义状态码 | \`status_code=201\` |
| 自定义响应头 | \`response.headers[...]\` |
| 设置 Cookie | \`response.set_cookie(...)\` |

**安全提示**：涉及密码、token 的接口，一定要用 response_model 过滤。`
  },

  {
    id: "fl-form-files",
    group: "请求与数据",
    icon: "📎",
    title: "表单与文件",
    content: `# 表单与文件

## 表单和 JSON 的区别

\`\`\`python
# 请求体有两种常见格式：
# 1. application/json    —— JSON 数据（默认，前面用的都是这种）
# 2. application/x-www-form-urlencoded —— 表单数据（HTML 表单默认）
# 3. multipart/form-data —— 文件上传专用
#
# 注意：一个接口只能接收一种格式
# 用 Form 就不能用 JSON 模型，反之亦然
\`\`\`

## Demo 1：接收表单（Form）

\`\`\`python
# 导入 FastAPI 类
# 导入 Form，用于接收表单字段（application/x-www-form-urlencoded）
from fastapi import FastAPI, Form

# 创建应用实例
app = FastAPI()

# 用 Form 替代 Pydantic 模型接收表单
@app.post("/login")
def login(
    username: str = Form(...),   # ... 表示必填
    password: str = Form(...),
    remember: bool = Form(False),
):
    # 参数 username: str = Form(...) 表示从表单字段读取
    # Form(...) 的 ... 表示必填，等价于无默认值
    # 客户端要用 Content-Type: application/x-www-form-urlencoded
    return {
        "username": username,
        "remember": remember,
    }

# curl 示例：
# curl -X POST http://localhost:8000/login \\
#      -d "username=admin&password=123&remember=true"
\`\`\`

## Demo 2：单文件上传

\`\`\`python
# 导入 FastAPI 类
# 导入 UploadFile，专门用于接收上传文件
from fastapi import FastAPI, UploadFile

# 创建应用实例
app = FastAPI()

# UploadFile 专门接收文件
@app.post("/upload")
async def upload_file(file: UploadFile):
    # 参数 file: UploadFile 由 FastAPI 自动注入
    # UploadFile 是异步文件对象，有以下属性/方法：
    # file.filename    —— 文件名
    # file.content_type —— MIME 类型，如 image/png
    # file.size        —— 文件大小（字节）
    # await file.read() —— 读取内容（异步）
    # await file.close() —— 关闭文件

    content = await file.read()  # 读取全部内容到内存
    return {
        "filename": file.filename,
        "size": len(content),
        "type": file.content_type,
    }

# 测试：
# curl -X POST http://localhost:8000/upload -F "file=@photo.png"
# -F 表示上传文件，@ 后面是本地文件路径
\`\`\`

## Demo 3：保存上传文件

\`\`\`python
# 导入 FastAPI 类和 UploadFile
from fastapi import FastAPI, UploadFile
# 导入 shutil，标准库，提供文件操作工具
import shutil
# 导入 Path，pathlib 提供的路径操作类，比 os.path 更优雅
from pathlib import Path

# 创建应用实例
app = FastAPI()
UPLOAD_DIR = Path("uploads")
# mkdir(exist_ok=True) 创建目录，如果已存在不报错
UPLOAD_DIR.mkdir(exist_ok=True)  # 确保目录存在

@app.post("/upload")
async def upload_file(file: UploadFile):
    # 推荐用流式写入，避免大文件撑爆内存
    # / 操作符拼接路径，Path 对象支持
    dest = UPLOAD_DIR / file.filename
    with dest.open("wb") as buffer:
        # shutil.copyfileobj 把文件流复制到目标
        # 比一次性 read + write 更省内存
        shutil.copyfileobj(file.file, buffer)
    return {"saved_to": str(dest), "size": dest.stat().st_size}

# async 写法（更推荐，不阻塞）：
# async with aiofiles.open(dest, 'wb') as out:
#     while chunk := await file.read(1024 * 1024):  # 1MB 一块
#         await out.write(chunk)
\`\`\`

## Demo 4：多文件上传

\`\`\`python
# 导入 FastAPI 类和 UploadFile
from fastapi import FastAPI, UploadFile

# 创建应用实例
app = FastAPI()

# 参数类型用 list[UploadFile] 接收多个文件
@app.post("/uploads")
async def upload_files(files: list[UploadFile]):
    # 参数 files: list[UploadFile] 接收文件列表
    results = []
    for f in files:
        # 逐个处理
        results.append({
            "filename": f.filename,
            "size": f.size,
        })
    return {"count": len(results), "files": results}

# curl 测试：
# curl -X POST http://localhost:8000/uploads \\
#      -F "files=@a.txt" -F "files=@b.txt"
\`\`\`

## Demo 5：文件 + 表单字段

\`\`\`python
# 导入 FastAPI 类、UploadFile、Form
from fastapi import FastAPI, UploadFile, Form

# 创建应用实例
app = FastAPI()

# 文件和表单字段可以一起传（都是 multipart/form-data）
@app.post("/profile")
async def update_profile(
    name: str = Form(...),        # 表单字段
    avatar: UploadFile = Form(...),  # 文件字段
):
    # 参数 name: str = Form(...) 表单字段，必填
    # 参数 avatar: UploadFile = Form(...) 文件字段，必填
    content = await avatar.read()
    return {
        "name": name,
        "avatar_name": avatar.filename,
        "avatar_size": len(content),
    }

# curl 测试：
# curl -X POST http://localhost:8000/profile \\
#      -F "name=张三" -F "avatar=@me.jpg"
\`\`\`

## Demo 6：返回文件（文件下载）

\`\`\`python
# 导入 FastAPI 类
from fastapi import FastAPI
# 导入 FileResponse，用于返回文件给客户端下载
from fastapi.responses import FileResponse

# 创建应用实例
app = FastAPI()

@app.get("/download/{filename}")
def download(filename: str):
    # 参数 filename: str 从路径提取
    # FileResponse 让浏览器下载文件
    # media_type 指定 MIME 类型
    # filename 设置下载时保存的文件名
    return FileResponse(
        path=f"uploads/{filename}",
        media_type="application/octet-stream",
        filename=filename,  # 浏览器下载时显示的名字
    )

# 访问 /download/photo.png 浏览器会下载文件
\`\`\`

## Demo 7：bytes vs UploadFile

\`\`\`python
# 导入 FastAPI 类、File、UploadFile
# File 用于声明文件参数（和 Form 类似，但用于文件）
from fastapi import FastAPI, File, UploadFile

# 创建应用实例
app = FastAPI()

# 两种接收文件的方式：
# 1. bytes: File(...) —— 简单，但整个文件读进内存
@app.post("/upload-bytes")
def upload_bytes(file: bytes = File(...)):
    # 参数 file: bytes = File(...) 整个文件作为 bytes 读入
    # file 是 bytes，整个文件内容
    return {"size": len(file)}

# 2. UploadFile —— 推荐，流式处理，适合大文件
@app.post("/upload-file")
async def upload_file(file: UploadFile):
    content = await file.read()
    return {"size": len(content), "name": file.filename}

# 选择建议：
# - 小文件 + 需要简单 → bytes
# - 大文件 / 需要文件名等元信息 → UploadFile（推荐）
\`\`\`

## 小结

| 需求 | 写法 |
|------|------|
| 表单字段 | \`x: str = Form(...)\` |
| 单文件 | \`file: UploadFile\` |
| 多文件 | \`files: list[UploadFile]\` |
| 文件下载 | \`FileResponse(path=...)\` |
| 表单+文件 | Form 和 UploadFile 混用 |

文件上传要装 \`python-multipart\`：\`pip install python-multipart\`。`
  }
];
