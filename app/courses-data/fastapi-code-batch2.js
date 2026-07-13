// =============================================================
// FastAPI 代码详解 - 第 2 批：数据处理（4 章）
// -------------------------------------------------------------
// 本批章节：
//   fc-validation:  数据校验与 Pydantic
//   fc-form-file:   表单与文件上传
//   fc-header:      请求头与响应头
//   fc-error:       状态码与错误处理
//
// 编写原则：demo 驱动，重点在代码注释里讲解，少废话
// =============================================================

export const chapters = [
  {
    id: "fc-validation",
    group: "数据处理",
    icon: "✅",
    title: "数据校验与 Pydantic",
    content: `# 数据校验与 Pydantic

## Pydantic 是什么

Pydantic 是 FastAPI 的数据校验引擎。你用类型注解定义数据模型，Pydantic 自动校验、转换、甚至提供默认值。

## Demo 1：基本校验规则

\`\`\`python
# 导入 BaseModel 和 Field
# Field 用于给字段加约束（长度、范围、正则等）
from pydantic import BaseModel, Field

# 字段校验规则全写在 Field() 里
class User(BaseModel):
    name: str = Field(
        min_length=2,       # 最少 2 个字符
        max_length=50,      # 最多 50 个字符
    )
    age: int = Field(
        ge=0,               # greater than or equal：>= 0
        le=150,             # less than or equal：<= 150
    )
    email: str = Field(
        pattern=r"^[\\w.-]+@[\\w.-]+\\.\\w+$",  # pattern：正则校验邮箱格式
    )
    score: float = Field(
        gt=0,               # greater than：> 0
        lt=100,             # less than：< 100
    )

# 测试：
# ✅ {"name":"张三","age":25,"email":"zs@test.com","score":85.5}
# ❌ {"name":"张","age":25,...}          → 422：name 至少 2 个字符
# ❌ {"name":"张三","age":-1,...}        → 422：age 必须 >= 0
# ❌ {"name":"张三","age":25,"email":"bad"} → 422：邮箱格式不对
\`\`\`

## Demo 2：常用校验器一览

\`\`\`python
# 导入 BaseModel、Field、validator
# validator 是 Pydantic v1 的自定义校验器装饰器（v2 用 field_validator）
from pydantic import BaseModel, Field, validator
# 导入 List，typing 模块的类型注解
from typing import List
# 导入 date，日期类型
from datetime import date

class Product(BaseModel):
    # 字符串校验
    # strip_whitespace=True：自动去除首尾空格
    name: str = Field(min_length=1, max_length=100, strip_whitespace=True)  # 自动去首尾空格
    # 数字校验
    price: float = Field(gt=0, le=999999)
    stock: int = Field(ge=0, default=0)  # 库存 >= 0，默认 0
    # 列表校验
    # min_items/max_items：列表元素数量限制
    tags: List[str] = Field(default=[], min_items=0, max_items=10)  # 最多 10 个标签
    # 日期校验
    expiry_date: date | None = Field(default=None)  # 可选日期

    # 自定义校验器：用 @validator 装饰器
    # 参数是要校验的字段名
    @validator("name")
    def name_not_empty(cls, v):
        # cls 是类本身（类方法）
        # v 是字段值
        if not v.strip():
            raise ValueError("名称不能为空")
        return v.strip()  # 校验通过必须返回值（可以返回处理后的值）

    @validator("price")
    def price_two_decimals(cls, v):
        # 确保价格最多两位小数
        # round(数值, 小数位) 四舍五入
        return round(v, 2)
\`\`\`

## Demo 3：嵌套模型校验

\`\`\`python
class Address(BaseModel):
    city: str = Field(min_length=1)
    street: str = Field(min_length=1)
    zip_code: str = Field(pattern=r"^\\d{6}$")  # 6 位邮编

class Order(BaseModel):
    user_name: str
    items: list[str] = Field(min_items=1)  # 至少一件商品
    address: Address  # 嵌套模型，Address 的校验规则也会生效

# 请求体示例：
# {
#   "user_name": "张三",
#   "items": ["苹果", "香蕉"],
#   "address": {"city": "北京", "street": "长安街", "zip_code": "100000"}
# }
# 如果 zip_code 不是 6 位数字 → 422 错误
\`\`\`

## Demo 4：模型配置（Config）

\`\`\`python
class User(BaseModel):
    name: str
    age: int

    class Config:
        # 允许从 ORM 对象创建（用于数据库查询结果直接转模型）
        orm_mode = True
        # 示例数据（显示在 /docs 文档中）
        schema_extra = {
            "example": {
                "name": "张三",
                "age": 25,
            }
        }
        # 禁止额外字段（请求带未定义的字段 → 报错）
        extra = "forbid"

# extra = "forbid" 的作用：
# 请求 {"name":"张三","age":25,"hack":true}
# → 422 错误："hack" 是额外字段，不允许
# 默认是 extra = "ignore"，会忽略额外字段
\`\`\`

## Demo 5：数据转换

\`\`\`python
from pydantic import BaseModel
from datetime import datetime

class Event(BaseModel):
    title: str
    # datetime 字符串会自动转成 datetime 对象
    start_time: datetime
    end_time: datetime

# 请求时传字符串：
# {"title":"会议","start_time":"2024-01-01T09:00:00","end_time":"2024-01-01T10:00:00"}
# Pydantic 自动把 ISO 格式字符串转成 datetime 对象

# 甚至可以转多种格式：
class Number(BaseModel):
    # 字符串 "123" 自动转成整数 123
    value: int

# 请求 {"value": "123"} → 自动转成 int 123
\`\`\`

## 小结

| 校验方式 | 语法 |
|---------|------|
| 最小/最大长度 | min_length / max_length |
| 数值范围 | gt / ge / lt / le |
| 正则匹配 | pattern |
| 列表长度 | min_items / max_items |
| 自定义校验 | @validator 装饰器 |
| 额外字段 | Config.extra = "forbid" |`
  },

  {
    id: "fc-form-file",
    group: "数据处理",
    icon: "📤",
    title: "表单与文件上传",
    content: `# 表单与文件上传

## 表单数据 vs JSON

- JSON：Content-Type 是 application/json，用 Pydantic 模型接收
- 表单：Content-Type 是 application/x-www-form-urlencoded 或 multipart/form-data，用 Form() 接收

## Demo 1：表单数据接收

\`\`\`python
from fastapi import FastAPI, Form  # Form 用于接收表单字段

app = FastAPI()

# 用 Form() 声明表单字段，和查询参数类似但数据来自请求体
@app.post("/login")
def login(
    username: str = Form(),  # Form() 表示从表单中读取
    password: str = Form(),  # 表单字段名和参数名一致
):
    # 注意：表单数据是 key=value 格式，不是 JSON
    return {"username": username}

# 测试（用 curl 或 Postman 或 /docs 页面）：
# curl -X POST http://localhost:8000/login \\
#   -d "username=admin&password=123456"
\`\`\`

## Demo 2：表单 + 文件上传

\`\`\`python
# 导入 FastAPI 类、File（文件声明）、UploadFile（文件类型）、Form（表单字段）
from fastapi import FastAPI, File, UploadFile, Form

# 创建应用实例
app = FastAPI()

# 上传单个文件：UploadFile 类型
# async def 异步函数，因为文件读取是异步的
@app.post("/upload")
async def upload_file(file: UploadFile = File()):
    # 参数 file: UploadFile = File() 表示从 multipart/form-data 接收文件
    # UploadFile 是异步文件对象，有以下属性：
    # file.filename  → 原始文件名
    # file.content_type → MIME 类型（如 image/png）
    # file.size      → 文件大小（需要先读取）

    # 读取文件内容
    # await file.read() 异步读取全部字节内容
    content = await file.read()  # await 读取字节内容

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(content),  # 读取后才能知道大小
    }
\`\`\`

## Demo 3：多文件上传

\`\`\`python
from typing import List

# 上传多个文件：List[UploadFile]
@app.post("/upload-multiple")
async def upload_files(files: List[UploadFile] = File()):
    # 一次上传多个文件
    result = []
    for f in files:
        content = await f.read()
        result.append({
            "filename": f.filename,
            "size": len(content),
        })
    return {"files": result}
\`\`\`

## Demo 4：表单 + 文件混合上传

\`\`\`python
@app.post("/upload-with-info")
async def upload_with_info(
    title: str = Form(),           # 表单字段
    description: str = Form(""),   # 表单字段，默认空字符串
    file: UploadFile = File(),     # 文件字段
):
    # 同时接收表单字段和文件
    content = await file.read()
    return {
        "title": title,
        "description": description,
        "filename": file.filename,
        "file_size": len(content),
    }

# 测试（curl）：
# curl -X POST http://localhost:8000/upload-with-info \\
#   -F "title=头像" \\
#   -F "description=用户头像" \\
#   -F "file=@avatar.png"
\`\`\`

## Demo 5：保存上传的文件

\`\`\`python
# 导入 aiofiles，异步文件操作库
# pip install aiofiles
import aiofiles

# async def 异步函数
@app.post("/upload-save")
async def upload_and_save(file: UploadFile = File()):
    # 参数 file: UploadFile = File() 接收上传的文件
    # 保存到本地磁盘
    # f"uploads/{file.filename}" 用 f-string 拼接保存路径
    save_path = f"uploads/{file.filename}"

    # aiofiles 提供异步文件写入，不阻塞事件循环
    # "wb" 表示二进制写入模式
    async with aiofiles.open(save_path, "wb") as f:
        content = await file.read()  # 异步读取文件内容
        await f.write(content)       # 异步写入磁盘

    return {"saved": save_path, "size": len(content)}
\`\`\`

## Demo 6：限制文件大小

\`\`\`python
# 导入 HTTPException
from fastapi import HTTPException

# 最大文件大小：5MB（5 * 1024 * 1024 字节）
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@app.post("/upload-limited")
async def upload_limited(file: UploadFile = File()):
    # 参数 file: UploadFile = File() 接收上传的文件
    # 读取文件内容
    content = await file.read()

    # 检查文件大小
    if len(content) > MAX_FILE_SIZE:
        # 413 Payload Too Large：请求体过大
        raise HTTPException(
            status_code=413,  # 413 Payload Too Large
            # // 是整除，避免出现小数
            detail=f"文件不能超过 {MAX_FILE_SIZE // 1024 // 1024}MB",
        )

    return {"filename": file.filename, "size": len(content)}
\`\`\`

## 小结

| 方式 | 参数声明 | Content-Type |
|------|---------|-------------|
| JSON | Pydantic 模型 | application/json |
| 表单 | Form() | application/x-www-form-urlencoded |
| 文件 | UploadFile + File() | multipart/form-data |
| 混合 | Form() + File() | multipart/form-data |`
  },

  {
    id: "fc-header",
    group: "数据处理",
    icon: "📋",
    title: "请求头与响应头",
    content: `# 请求头与响应头

## 请求头是什么

HTTP 请求头是客户端发给服务器的元数据，比如认证令牌、内容类型、语言偏好等。

## Demo 1：读取请求头

\`\`\`python
from fastapi import FastAPI, Header  # Header 用于读取请求头

app = FastAPI()

# 用 Header() 读取单个请求头
@app.get("/who")
def who_are_you(user_agent: str = Header()):
    # User-Agent 是浏览器标识，Python 变量名用下划线，FastAPI 自动转成连字符
    return {"user_agent": user_agent}

# 测试：curl http://localhost:8000/who -H "User-Agent: MyApp/1.0"
# → {"user_agent":"MyApp/1.0"}
\`\`\`

## Demo 2：自定义请求头

\`\`\`python
# 自定义请求头，默认 None 表示可选
@app.get("/api")
def read_api(
    x_token: str | None = Header(default=None),  # 可选的自定义头
    x_request_id: str = Header(),                # 必填的自定义头
):
    # X- 开头的头是自定义头的惯例
    return {"token": x_token, "request_id": x_request_id}

# 测试：
# curl http://localhost:8000/api -H "X-Request-Id: abc123"
# → {"token":null,"request_id":"abc123"}
\`\`\`

## Demo 3：Header 名称转换规则

\`\`\`python
@app.get("/headers-demo")
def headers_demo(
    # FastAPI 自动转换：Python 变量名 → HTTP 头名
    user_agent: str = Header(),     # → User-Agent
    content_type: str = Header(),   # → Content-Type
    x_custom_header: str = Header(),# → X-Custom-Header
    # 如果不想自动转换，用 convert_underscores=False
    my_header: str = Header(convert_underscores=False),  # → my_header（不转换）
):
    return {"ok": True}
\`\`\`

## Demo 4：设置响应头

\`\`\`python
# 导入 FastAPI 类和 Response 类
# Response 用于设置响应头和 Cookie
from fastapi import FastAPI, Response

# 创建应用实例
app = FastAPI()

# 参数 response: Response 由 FastAPI 自动注入
@app.get("/set-headers")
def set_headers(response: Response):
    # 在函数中直接修改 response 对象
    # response.headers 是字典，可以直接赋值
    response.headers["X-Custom-Header"] = "my-value"
    response.headers["X-Request-Time"] = "2024-01-01T00:00:00Z"
    # 也可以设置标准头
    response.headers["Cache-Control"] = "no-cache"

    return {"msg": "响应头已设置"}

# 用 curl -v 查看响应头：
# curl -v http://localhost:8000/set-headers
# 可以看到 X-Custom-Header 和 X-Request-Time 出现在响应中
\`\`\`

## Demo 5：Cookie 读取

\`\`\`python
from fastapi import Cookie  # Cookie 用于读取 Cookie

@app.get("/read-cookie")
def read_cookie(session_id: str | None = Cookie(default=None)):
    # Cookie 也是从请求头中读取的
    return {"session_id": session_id}

# 测试：curl http://localhost:8000/read-cookie -H "Cookie: session_id=abc123"
\`\`\`

## Demo 6：设置 Cookie

\`\`\`python
# 导入 JSONResponse，用于返回 JSON 响应（可设置 Cookie）
from fastapi.responses import JSONResponse

@app.post("/login-cookie")
def login_with_cookie():
    # 创建响应对象
    # JSONResponse 可以自定义状态码、响应头、Cookie
    response = JSONResponse(content={"msg": "登录成功"})

    # 设置 Cookie：key, value, 可选参数
    # set_cookie 的参数：
    response.set_cookie(
        key="session_id",     # Cookie 名
        value="abc123xyz",    # Cookie 值
        httponly=True,      # 只能通过 HTTP 读取，JS 无法访问（防 XSS）
        max_age=3600,       # 有效期 3600 秒（1 小时）
        secure=True,        # 仅 HTTPS 传输（生产环境用）
        samesite="lax",     # 同站请求才发送 Cookie（防 CSRF）
    )

    return response
\`\`\`

## Demo 7：获取所有请求头

\`\`\`python
# 导入 Request，请求对象类
from fastapi import Request

# 参数 request: Request 由 FastAPI 自动注入
# async def 异步函数
@app.get("/all-headers")
async def all_headers(request: Request):
    # Request 对象包含完整请求信息
    # request.headers 是字典，包含了所有请求头
    # .get(key) 取某个头，不存在返回 None
    return {
        "host": request.headers.get("host"),
        "user_agent": request.headers.get("user-agent"),
        "accept": request.headers.get("accept"),
        "all_headers": dict(request.headers),  # 所有头转成字典
    }
\`\`\`

## 小结

| 方法 | 用途 |
|------|------|
| Header() | 读取单个请求头 |
| Cookie() | 读取单个 Cookie |
| Response.headers | 设置响应头 |
| Response.set_cookie() | 设置 Cookie |
| Request | 获取完整请求信息 |`
  },

  {
    id: "fc-error",
    group: "数据处理",
    icon: "⚠️",
    title: "状态码与错误处理",
    content: `# 状态码与错误处理

## HTTP 状态码速查

| 状态码 | 含义 | 使用场景 |
|--------|------|---------|
| 200 | OK | 请求成功 |
| 201 | Created | 创建成功 |
| 204 | No Content | 成功但无返回内容（删除成功） |
| 400 | Bad Request | 客户端请求有误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 422 | Unprocessable | 校验失败 |
| 500 | Internal Error | 服务器内部错误 |

## Demo 1：手动设置状态码

\`\`\`python
# 导入 FastAPI 类和 status 模块
# status 模块包含所有 HTTP 状态码常量
from fastapi import FastAPI, status

# 创建应用实例
app = FastAPI()

# status_code 参数：设置成功响应的状态码
# status.HTTP_201_CREATED = 201（资源创建成功）
@app.post("/items", status_code=status.HTTP_201_CREATED)  # 创建成功返回 201
def create_item():
    # 装饰器中设置默认状态码，所有成功响应都返回 201
    return {"msg": "创建成功"}

# 也可以直接在函数中动态设置
@app.delete("/items/{item_id}")
def delete_item(item_id: int):
    # 参数 item_id: int 路径参数
    # 删除成功返回 204 No Content
    # Response(status_code=...) 返回空响应
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# 或者用 status_code 参数返回
@app.post("/users", status_code=201)  # 直接写数字也行
def create_user():
    return {"msg": "OK"}
\`\`\`

## Demo 2：HTTPException 抛异常

\`\`\`python
# 导入 FastAPI 类和 HTTPException
# HTTPException：FastAPI 内置异常类，抛出后自动转成 HTTP 错误响应
from fastapi import FastAPI, HTTPException

# 创建应用实例
app = FastAPI()

# 模拟数据库
items = {"1": "苹果", "2": "香蕉"}

@app.get("/items/{item_id}")
def get_item(item_id: str):
    # 参数 item_id: str 路径参数（字符串）
    # 查找数据，没找到就返回 404
    if item_id not in items:
        # raise 抛出异常后，后续代码不再执行
        raise HTTPException(
            status_code=404,            # 状态码：404 资源不存在
            detail=f"商品 {item_id} 不存在",  # detail：错误详情，作为响应体返回
            # headers：附加自定义响应头
            headers={"X-Error-Code": "ITEM_NOT_FOUND"},
        )
    return {"item": items[item_id]}
\`\`\`

## Demo 3：常见错误场景

\`\`\`python
from fastapi import HTTPException, status

# 场景 1：资源不存在
@app.get("/users/{user_id}")
def get_user(user_id: int):
    if user_id > 100:
        raise HTTPException(status_code=404, detail="用户不存在")
    return {"user_id": user_id}

# 场景 2：权限不足
@app.get("/admin")
def admin_panel(role: str = "user"):
    if role != "admin":
        raise HTTPException(
            status_code=403,  # 403 Forbidden
            detail="需要管理员权限",
        )
    return {"msg": "欢迎管理员"}

# 场景 3：参数冲突
@app.post("/register")
def register(username: str, email: str):
    if username == "admin":
        raise HTTPException(status_code=400, detail="用户名已被占用")
    return {"msg": "注册成功"}
\`\`\`

## Demo 4：全局异常处理

\`\`\`python
# 导入 FastAPI 类和 Request 类
from fastapi import FastAPI, Request
# 导入 JSONResponse
from fastapi.responses import JSONResponse

# 创建应用实例
app = FastAPI()

# 注册全局异常处理器，捕获所有未被处理的异常
# @app.exception_handler(Exception) 注册针对 Exception 的处理器
# Exception 是所有异常的基类，所以能兜底所有未捕获的异常
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # 参数 request: Request 当前请求对象
    # 参数 exc: Exception 抛出的异常实例
    # 任何未捕获的异常都会到这里
    return JSONResponse(
        status_code=500,
        content={
            "error": "服务器内部错误",
            # str(exc) 把异常转成字符串
            # 生产环境别暴露详细错误信息！
            "detail": str(exc),
        },
    )
\`\`\`

## Demo 5：自定义异常处理器（针对特定异常）

\`\`\`python
# @app.exception_handler(异常类) 注册针对特定异常的处理器

# 只处理 HTTPException
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    # 参数 request: Request 当前请求对象
    # 参数 exc: HTTPException 异常实例
    # exc.status_code 异常的状态码
    # exc.detail 异常的详情
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
        },
    )

# 只处理 ValueError
@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    # 参数 request: Request 当前请求对象
    # 参数 exc: ValueError 异常实例
    return JSONResponse(
        status_code=400,
        content={"error": str(exc)},
    )
\`\`\`

## Demo 6：自定义异常类

\`\`\`python
# 定义自己的异常类（继承 Exception）
# 自定义异常方便业务里 raise，由统一的 handler 处理
class ItemNotFoundError(Exception):
    def __init__(self, item_id: str):
        # 参数 item_id: str 异常携带的商品 ID
        self.item_id = item_id

# 注册针对 ItemNotFoundError 的处理器
@app.exception_handler(ItemNotFoundError)
async def item_not_found_handler(request: Request, exc: ItemNotFoundError):
    # 参数 request: Request 当前请求对象
    # 参数 exc: ItemNotFoundError 异常实例，可以取到 item_id
    return JSONResponse(
        status_code=404,
        content={"error": f"商品 {exc.item_id} 不存在"},
    )

@app.get("/products/{product_id}")
def get_product(product_id: str):
    # 参数 product_id: str 路径参数
    # 直接抛自定义异常，由上面的处理器处理
    raise ItemNotFoundError(product_id)
\`\`\`

## 小结

| 方式 | 适用场景 |
|------|---------|
| status_code 参数 | 固定的成功状态码 |
| raise HTTPException | 业务逻辑中的错误 |
| @app.exception_handler | 全局或特定异常处理 |
| 自定义异常类 | 项目中统一错误处理 |`
  },
];