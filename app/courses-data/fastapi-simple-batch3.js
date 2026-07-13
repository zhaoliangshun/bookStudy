// =============================================================
// FastAPI 实战教程（精简版）- 第 3 批章节（进阶实战 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fa-response: 响应处理
//   fa-middleware: 中间件与异常
//   fa-async: 异步与后台任务
//   fa-testing: 测试与部署
// ============================================================

export const chapters = [
  {
    id: "fa-response",
    group: "进阶实战",
    icon: "📤",
    title: "响应处理",
    content: `# 响应处理

## FastAPI 如何返回响应

FastAPI 会自动把返回值转成 JSON，但很多时候你需要精细控制：状态码、响应头、Cookie、文件下载等。

## Demo 1：response_model 控制返回字段

\`\`\`python
# 导入 FastAPI 框架核心类，用于创建应用实例和路由
from fastapi import FastAPI
# 导入 BaseModel，Pydantic 的基础模型类，用于定义数据结构并自动校验
from pydantic import BaseModel

# 创建 FastAPI 应用实例
app = FastAPI()

# 请求模型：接收用户注册数据（包含密码）
class UserIn(BaseModel):
    username: str   # 用户名，字符串类型
    password: str   # 密码，字符串类型（仅用于接收，不返回）
    email: str      # 邮箱，字符串类型

# 响应模型：返回给客户端的数据（不含密码）
class UserOut(BaseModel):
    # 响应用：不含 password，避免泄露敏感信息
    id: int         # 用户 ID，整数类型
    username: str   # 用户名
    email: str      # 邮箱

# @app.post 声明 POST 路由；response_model=UserOut 指定响应模型
# FastAPI 会用 UserOut 过滤返回值，只输出 UserOut 定义的字段
@app.post("/users", response_model=UserOut)
def create_user(user: UserIn):
    # 参数 user: UserIn 表示请求体会被自动解析并校验为 UserIn 对象
    # 即使返回包含 password 的字典，response_model 会过滤掉
    # 只返回 UserOut 里定义的字段
    return {
        "id": 1,
        "username": user.username,
        "password": user.password,  # 会被过滤掉！
        "email": user.email
    }

# POST /users
# Body: {"username": "alice", "password": "secret", "email": "a@b.com"}
# 返回：{"id": 1, "username": "alice", "email": "a@b.com"}
# password 不会出现在响应里
\`\`\`

## Demo 2：response_model_exclude 排除字段

\`\`\`python
# 导入 FastAPI 核心类
from fastapi import FastAPI
# 导入 BaseModel 用于定义数据模型
from pydantic import BaseModel

# 创建应用实例
app = FastAPI()

# 用户模型，包含所有字段
class User(BaseModel):
    username: str    # 用户名
    password: str    # 密码（敏感字段，需要在响应中排除）
    email: str       # 邮箱
    is_active: bool  # 是否激活，布尔类型

# 方式 1：response_model_exclude 排除指定字段
# response_model_exclude={"password"} 表示响应时排除 password 字段
@app.get("/users/{username}", response_model=User, response_model_exclude={"password"})
def get_user(username: str):
    # 参数 username: str 从路径中提取，自动转为字符串
    return {
        "username": "alice",
        "password": "secret",
        "email": "a@b.com",
        "is_active": True
    }

# 方式 2：response_model_include 只包含指定字段
# response_model_include={"username", "email"} 表示只返回这两个字段
# 比 exclude 更严格，适合精简响应
@app.get("/users/{username}/brief", response_model=User, response_model_include={"username", "email"})
def get_user_brief(username: str):
    return {
        "username": "alice",
        "password": "secret",
        "email": "a@b.com",
        "is_active": True
    }

# GET /users/alice → {"username": "alice", "email": "a@b.com", "is_active": true}
# GET /users/alice/brief → {"username": "alice", "email": "a@b.com"}
\`\`\`

## Demo 3：自定义状态码

\`\`\`python
# 导入 FastAPI 框架核心类
# 导入 status 模块，包含所有 HTTP 状态码常量（如 HTTP_201_CREATED）
from fastapi import FastAPI, status
# status 模块包含所有 HTTP 状态码常量

# 创建应用实例
app = FastAPI()

# 导入 BaseModel 用于定义请求体模型
from pydantic import BaseModel

# 商品模型
class Item(BaseModel):
    name: str  # 商品名称

# 方式 1：用 status_code 参数
# status.HTTP_201_CREATED 是常量，等价于数字 201，更可读
@app.post("/items", status_code=status.HTTP_201_CREATED)
def create_item(item: Item):
    # 参数 item: Item 表示请求体被解析为 Item 对象
    # 返回 201 Created 而不是默认的 200
    return item

# 方式 2：用装饰器参数（和方式 1 等价）
# 直接用数字 204 也可以，但建议用 status 常量提高可读性
@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int):
    # 参数 item_id: int 从路径中提取并自动转为整数
    # 204 No Content：成功但没有返回体
    return None

# 常用状态码：
# 200 OK - 默认
# 201 Created - 创建成功
# 204 No Content - 成功但无返回体
# 301 Moved Permanently - 永久重定向
# 400 Bad Request - 请求参数错误
# 401 Unauthorized - 未认证
# 403 Forbidden - 无权限
# 404 Not Found - 资源不存在
# 500 Internal Server Error - 服务器错误
\`\`\`

## Demo 4：自定义响应头

\`\`\`python
# 导入 FastAPI 核心类
# 导入 Response 类，用于直接操作响应对象（如设置响应头）
from fastapi import FastAPI, Response

# 创建应用实例
app = FastAPI()

# 方式 1：通过 Response 对象设置响应头
# 在路由参数中声明 response: Response，FastAPI 会自动注入响应对象
@app.get("/items")
def get_items(response: Response):
    # 参数 response: Response 由 FastAPI 自动注入，无需传值
    # 通过 Response 对象设置响应头
    # 自定义响应头通常用 X- 前缀（虽然新版规范已不强制，但仍是惯例）
    response.headers["X-Total-Count"] = "100"
    response.headers["X-Page-Size"] = "10"
    return [{"id": 1}, {"id": 2}]

# GET /items
# 响应头包含：
# X-Total-Count: 100
# X-Page-Size: 10
\`\`\`

## Demo 5：设置 Cookie

\`\`\`python
# 导入 FastAPI 核心类
# 导入 Response 类，用于设置 Cookie
# 导入 Cookie 函数，用于从请求中读取 Cookie 值
from fastapi import FastAPI, Response, Cookie

# 创建应用实例
app = FastAPI()

@app.post("/login")
def login(response: Response):
    # 参数 response: Response 由 FastAPI 自动注入
    # 设置 Cookie
    # key="token", value="abc123"
    # max_age=3600 表示 1 小时后过期（秒）
    # httponly=True 表示 JS 无法读取（防 XSS）
    # secure=True 表示只通过 HTTPS 传输
    response.set_cookie(
        key="token",            # Cookie 名称
        value="abc123",         # Cookie 值
        max_age=3600,           # 过期时间（秒），1 小时后失效
        httponly=True,          # 仅 HTTP 可访问，JS 读不到，防 XSS 攻击
        secure=True,            # 仅 HTTPS 传输，生产环境必须开启
        samesite="lax"          # 防止 CSRF 攻击，lax 是宽松模式
    )
    return {"message": "登录成功"}

@app.get("/me")
def get_me(token: str | None = Cookie(default=None)):
    # 参数 token: str | None = Cookie(default=None) 表示从请求头 Cookie 里读取名为 token 的值
    # Cookie() 用法和 Query() 类似，都是从请求中提取数据
    # default=None 表示 Cookie 不存在时返回 None（可选 Cookie）
    if not token:
        return {"error": "未登录"}
    return {"user": "alice", "token": token}

# 流程：
# 1. POST /login → 响应里 Set-Cookie: token=abc123
# 2. 浏览器自动保存 Cookie
# 3. GET /me → 浏览器自动带上 Cookie: token=abc123
\`\`\`

## Demo 6：返回文件（FileResponse）

\`\`\`python
# 导入 FastAPI 核心类
from fastapi import FastAPI
# 导入 FileResponse 类，用于返回文件给客户端下载
from fastapi.responses import FileResponse

# 创建应用实例
app = FastAPI()

# 返回文件下载
@app.get("/download/{filename}")
def download_file(filename: str):
    # 参数 filename: str 从路径中提取，是用户要下载的文件名
    # FileResponse 会自动：
    # 1. 设置 Content-Type（根据文件后缀）
    # 2. 设置 Content-Length
    # 3. 设置 Content-Disposition（触发下载）
    return FileResponse(
        path=f"./files/{filename}",                          # 服务器上文件的绝对或相对路径
        filename=filename,                                   # 下载时显示的文件名
        media_type="application/octet-stream"                # 二进制流，强制浏览器下载
    )

# 常用 Response 类型：
# - FileResponse: 文件
# - HTMLResponse: HTML 页面
# - JSONResponse: JSON（默认）
# - RedirectResponse: 重定向
# - StreamingResponse: 流式响应（大文件、视频）
# - PlainTextResponse: 纯文本
\`\`\`

## Demo 7：StreamingResponse 流式响应

\`\`\`python
# 导入 FastAPI 核心类
from fastapi import FastAPI
# 导入 StreamingResponse 类，用于流式返回数据（边生成边发送）
from fastapi.responses import StreamingResponse
# 导入 time 模块，用于模拟耗时操作
import time

# 创建应用实例
app = FastAPI()

# 生成器函数：逐块产出数据
# 生成器用 yield 关键字，每次产出一个值，暂停执行，下次调用从上次位置继续
def generate_data():
    for i in range(10):
        # yield 产出数据块
        yield f"数据块 {i}\\n"
        time.sleep(0.5)  # 模拟耗时操作，每次间隔 0.5 秒

@app.get("/stream")
def stream_data():
    # StreamingResponse 接收生成器，逐块发送数据给客户端
    # 适合：大文件、实时日志、SSE（Server-Sent Events）
    # media_type="text/plain" 表示纯文本内容
    return StreamingResponse(
        generate_data(),
        media_type="text/plain"
    )

# 访问 /stream，浏览器会逐步收到数据
# 而不是等全部生成完再一次性返回
\`\`\`

## 本章小结

| 知识点 | 要点 |
|--------|------|
| response_model | 控制返回哪些字段，过滤敏感数据 |
| 状态码 | status_code 参数或 status 常量 |
| 响应头 | 通过 Response 对象设置 |
| Cookie | set_cookie() 设置，Cookie() 读取 |
| 文件响应 | FileResponse 返回文件 |
| 流式响应 | StreamingResponse 逐块发送 |

下一章我们学习中间件和异常处理。`
  },
  {
    id: "fa-middleware",
    group: "进阶实战",
    icon: "🛡️",
    title: "中间件与异常",
    content: `# 中间件与异常

## 什么是中间件

中间件是在路由处理之前/之后执行的代码。用于：日志、认证、CORS、请求修改等。

## Demo 1：基本中间件

\`\`\`python
# 导入 FastAPI 核心类
# 导入 Request 类，用于获取请求对象（方法、路径、头等）
from fastapi import FastAPI, Request
# 导入 time 模块，用于计算请求耗时
import time

# 创建应用实例
app = FastAPI()

# 用 @app.middleware("http") 注册中间件
# "http" 表示这是 HTTP 中间件（FastAPI 也支持 WebSocket 中间件）
@app.middleware("http")
async def log_requests(request: Request, call_next):
    # 参数 request: Request 包含本次请求的所有信息
    # 参数 call_next: 下一个处理函数（可能是下一个中间件或路由）
    # 中间件必须是 async 函数，因为要 await call_next
    
    # call_next 之前的代码：请求到达路由之前执行
    
    # 记录请求开始时间
    start_time = time.time()
    
    # 打印请求信息
    # request.method 是 HTTP 方法（GET/POST 等）
    # request.url.path 是请求路径（不含查询参数）
    print(f"请求开始: {request.method} {request.url.path}")
    
    # call_next 把请求传递给下一个中间件或路由
    # await 等待路由处理完成并返回响应
    response = await call_next(request)
    
    # call_next 之后的代码：路由处理完之后执行
    
    # 计算耗时
    process_time = time.time() - start_time
    print(f"请求完成: {request.method} {request.url.path} - {process_time:.3f}s")
    
    # 在响应头里添加耗时信息
    # 可以直接修改 response 对象，添加自定义响应头
    response.headers["X-Process-Time"] = str(process_time)
    
    # 必须返回 response，否则客户端收不到响应
    return response

# 中间件执行顺序：
# 请求 → 中间件1前 → 中间件2前 → 路由 → 中间件2后 → 中间件1后 → 响应
\`\`\`

## Demo 2：CORS 中间件

\`\`\`python
# 导入 FastAPI 核心类
from fastapi import FastAPI
# 导入 CORSMiddleware，FastAPI 内置的跨域中间件
from fastapi.middleware.cors import CORSMiddleware

# 创建应用实例
app = FastAPI()

# CORS（跨域资源共享）
# 当前端（如 localhost:3000）请求后端（如 localhost:8000）时
# 浏览器会阻止跨域请求，除非后端允许

# app.add_middleware 添加中间件
app.add_middleware(
    CORSMiddleware,
    # 允许的前端地址（* 表示所有，生产环境要指定具体域名）
    # allow_origins 是允许跨域访问的源列表
    allow_origins=["http://localhost:3000", "https://myapp.com"],
    # 允许的 HTTP 方法
    # 不在列表中的方法会被浏览器拦截
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    # 允许的请求头
    # "*" 表示允许所有自定义请求头
    allow_headers=["*"],
    # 允许携带 Cookie
    # 注意：allow_credentials=True 时，allow_origins 不能为 ["*"]
    allow_credentials=True,
    # 预检请求缓存时间（秒）
    # 浏览器会缓存预检结果，max_age 期间内不再发 OPTIONS 请求
    max_age=600,
)

@app.get("/api/data")
def get_data():
    return {"data": "hello"}

# 没有 CORS 中间件：
# 前端 fetch("http://localhost:8000/api/data") → 浏览器拦截
#
# 有 CORS 中间件：
# 浏览器先发 OPTIONS 预检请求
# 后端返回 Access-Control-Allow-Origin: http://localhost:3000
# 浏览器放行实际请求
\`\`\`

## Demo 3：自定义中间件类

\`\`\`python
# 导入 FastAPI 核心类和 Request
from fastapi import FastAPI, Request
# 导入 BaseHTTPMiddleware，Starlette 提供的中间件基类
# 用类写中间件比函数更灵活，可以保存状态
from starlette.middleware.base import BaseHTTPMiddleware

# 创建应用实例
app = FastAPI()

# 用类定义中间件，更灵活
# 继承 BaseHTTPMiddleware 并实现 dispatch 方法
class AuthMiddleware(BaseHTTPMiddleware):
    # dispatch 方法类似函数式中间件，接收 request 和 call_next
    async def dispatch(self, request: Request, call_next):
        # 跳过不需要认证的路径
        # request.url.path 是请求路径
        if request.url.path in ["/", "/docs", "/openapi.json", "/login"]:
            # 公开路径直接放行，不检查认证
            return await call_next(request)
        
        # 检查 Authorization 头
        # request.headers.get() 读取请求头，不存在返回 None
        token = request.headers.get("Authorization")
        if not token:
            # 返回 401 错误
            # 局部导入避免文件顶部依赖
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=401,                            # 401 表示未认证
                content={"detail": "未提供认证信息"}
            )
        
        # 验证 token（简化示例）
        # 实际项目里这里应该解析 JWT
        if not token.startswith("Bearer "):
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=401,
                content={"detail": "无效的认证格式"}
            )
        
        # 通过认证，继续处理
        response = await call_next(request)
        return response

# 注册中间件
# 用类作为中间件时，传类名（不是实例）
app.add_middleware(AuthMiddleware)

@app.get("/")
def root():
    return {"message": "公开页面"}

@app.get("/protected")
def protected():
    return {"message": "受保护的页面"}

# GET / → 不需要认证
# GET /protected → 需要 Authorization 头
\`\`\`

## Demo 4：异常处理

\`\`\`python
# 导入 FastAPI 核心类
# 导入 HTTPException，FastAPI 内置异常类，用于抛出 HTTP 错误
# 导入 Request，用于异常处理器获取请求信息
from fastapi import FastAPI, HTTPException, Request
# 导入 JSONResponse，用于自定义 JSON 响应
from fastapi.responses import JSONResponse

# 创建应用实例
app = FastAPI()

# 方式 1：用 HTTPException 抛出 HTTP 错误
@app.get("/items/{item_id}")
def get_item(item_id: int):
    # 参数 item_id: int 从路径提取并自动转为整数（无法转则 422）
    # 模拟数据库查询
    items = {1: "apple", 2: "banana"}
    
    if item_id not in items:
        # 抛出 404 错误
        # HTTPException 会被 FastAPI 自动捕获并转成 JSON 错误响应
        raise HTTPException(
            status_code=404,                                   # HTTP 状态码
            detail=f"Item {item_id} not found",                # 错误详情，会作为响应体
            headers={"X-Error": "Item not found"}              # 可选：自定义响应头
        )
    
    return {"item": items[item_id]}

# 方式 2：自定义异常处理器
# 继承 Exception 创建业务异常类
class CustomException(Exception):
    def __init__(self, code: str, message: str):
        # code: 业务错误码（如 INVALID_INPUT）
        # message: 错误信息（给用户看的）
        self.code = code
        self.message = message

# 注册异常处理器
# @app.exception_handler(异常类) 表示捕获该类型的异常
@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    # 参数 request: Request 触发异常的请求
    # 参数 exc: CustomException 抛出的异常实例
    return JSONResponse(
        status_code=400,                       # 自定义状态码
        content={
            "error_code": exc.code,            # 业务错误码
            "error_message": exc.message       # 错误信息
        }
    )

@app.get("/trigger-error")
def trigger_error():
    # 抛出自定义异常
    # 异常会被上面的处理器捕获，转成 JSON 响应
    raise CustomException(
        code="INVALID_INPUT",
        message="输入参数不合法"
    )

# GET /trigger-error
# 返回：{"error_code": "INVALID_INPUT", "error_message": "输入参数不合法"}
\`\`\`

## Demo 5：覆盖默认异常处理器

\`\`\`python
# 导入 FastAPI 核心类和 Request
from fastapi import FastAPI, Request
# 导入 JSONResponse，用于自定义响应
from fastapi.responses import JSONResponse
# 导入 RequestValidationError，FastAPI 请求参数校验失败时抛出的异常
# 默认会返回 422 状态码和 FastAPI 格式的错误信息
from fastapi.exceptions import RequestValidationError

# 创建应用实例
app = FastAPI()

# 覆盖 422 校验错误的默认格式
# 注册 RequestValidationError 的处理器，替换默认行为
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # exc.errors() 返回所有校验错误的列表
    # 每个错误包含 loc（字段位置）、msg（错误信息）、type（错误类型）
    return JSONResponse(
        status_code=422,
        content={
            "error": "VALIDATION_ERROR",
            "message": "请求参数校验失败",
            "details": [
                # 列表推导式：遍历所有错误，提取字段和消息
                {
                    # err["loc"] 是元组，如 ("body", "name")，表示 body 里的 name 字段
                    # ".".join() 把元组拼成字符串 "body.name"
                    "field": ".".join(str(loc) for loc in err["loc"]),
                    "message": err["msg"]
                }
                for err in exc.errors()
            ]
        }
    )

# 覆盖后，422 错误返回：
# {
#   "error": "VALIDATION_ERROR",
#   "message": "请求参数校验失败",
#   "details": [{"field": "body.name", "message": "field required"}]
# }
\`\`\`

## Demo 6：全局异常捕获

\`\`\`python
# 导入 FastAPI 核心类和 Request
from fastapi import FastAPI, Request
# 导入 JSONResponse，用于自定义错误响应
from fastapi.responses import JSONResponse
# 导入 logging 模块，Python 标准日志库
import logging

# 创建应用实例
app = FastAPI()

# 配置日志
# basicConfig 配置根日志记录器，level=logging.ERROR 表示只记录 ERROR 及以上级别
logging.basicConfig(level=logging.ERROR)
# 获取当前模块的 logger
logger = logging.getLogger(__name__)

# 捕获所有未处理的异常
# @app.exception_handler(Exception) 注册 Exception 的处理器
# Exception 是所有异常的基类，所以能捕获所有未处理的异常
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # 参数 exc: Exception 捕获到的异常实例
    # 记录详细错误到日志（不暴露给用户）
    # exc_info=True 会记录完整的堆栈信息
    logger.error(f"未处理异常: {exc}", exc_info=True)
    
    # 返回通用错误信息给用户
    # 不暴露具体错误，避免泄露服务器内部信息
    return JSONResponse(
        status_code=500,                            # 500 服务器内部错误
        content={
            "error": "INTERNAL_ERROR",
            "message": "服务器内部错误，请稍后重试"
        }
    )

@app.get("/crash")
def crash():
    # 这里会抛出 ZeroDivisionError
    # 1 / 0 在 Python 中会抛出 ZeroDivisionError
    result = 1 / 0
    return {"result": result}

# GET /crash
# 日志里记录：ZeroDivisionError: division by zero
# 用户看到：{"error": "INTERNAL_ERROR", "message": "服务器内部错误，请稍后重试"}
# 好处：不暴露堆栈信息，更安全
\`\`\`

## 本章小结

| 知识点 | 要点 |
|--------|------|
| 中间件 | 请求前后执行的代码，用 @app.middleware |
| CORS | 解决跨域问题，用 CORSMiddleware |
| 自定义中间件 | 继承 BaseHTTPMiddleware |
| HTTPException | 抛出 HTTP 错误 |
| 异常处理器 | @app.exception_handler 自定义错误格式 |
| 全局捕获 | 捕获 Exception，避免暴露堆栈 |

下一章我们学习异步编程和后台任务。`
  },
  {
    id: "fa-async",
    group: "进阶实战",
    icon: "⚙️",
    title: "异步与后台任务",
    content: `# 异步与后台任务

## 什么是异步

异步（async/await）让程序在等待 IO 时去做别的事，而不是傻等。FastAPI 基于 ASGI，原生支持异步。

## Demo 1：同步 vs 异步路由

\`\`\`python
# 导入 FastAPI 核心类
from fastapi import FastAPI
# 导入 time 模块，提供同步 sleep 函数
import time
# 导入 asyncio 模块，提供异步 sleep 等异步工具
import asyncio

# 创建应用实例
app = FastAPI()

# 同步路由：适合 CPU 密集型任务
# 用 def 定义，FastAPI 会在线程池中运行，不会阻塞事件循环
@app.get("/sync")
def sync_endpoint():
    # time.sleep 是同步阻塞，会卡住当前线程
    # 但因为在线程池里运行，不会卡住整个服务器
    time.sleep(2)
    return {"message": "同步完成", "time": time.time()}

# 异步路由：适合 IO 密集型任务
# 用 async def 定义，在事件循环中运行
@app.get("/async")
async def async_endpoint():
    # asyncio.sleep 是异步等待，不会卡住服务器
    # 等待期间事件循环可以处理其他请求
    await asyncio.sleep(2)
    return {"message": "异步完成", "time": time.time()}

# 区别：
# - def 定义同步路由：在线程池里运行，适合 CPU 密集
# - async def 定义异步路由：在事件循环里运行，适合 IO 密集
#
# ⚠️ 注意：
# - 异步路由里不能用 time.sleep()，要用 await asyncio.sleep()
# - 同步路由里不能用 await
# - 如果不确定，用 def（同步）更安全
\`\`\`

## Demo 2：异步调用外部库

\`\`\`python
# 导入 FastAPI 核心类
from fastapi import FastAPI
# 导入 asyncio，用于并发执行多个任务
import asyncio
# 导入 httpx，异步 HTTP 客户端库（类似 requests 但支持异步）
import httpx

# 创建应用实例
app = FastAPI()

# 异步调用外部 API
@app.get("/fetch")
async def fetch_data():
    # httpx.AsyncClient 是异步 HTTP 客户端
    # async with 确保请求结束后正确关闭连接
    async with httpx.AsyncClient() as client:
        # await 等待请求完成，期间可以处理其他请求
        # client.get 发送 GET 请求
        response = await client.get("https://api.github.com/users/octocat")
        # response.json() 把响应体解析为字典
        data = response.json()
    
    return {
        "login": data.get("login"),    # GitHub 用户名
        "name": data.get("name"),      # 显示名称
        "bio": data.get("bio")         # 个人简介
    }

# 并发请求多个 API
@app.get("/fetch-all")
async def fetch_all():
    async with httpx.AsyncClient() as client:
        # asyncio.gather 并发执行多个异步任务
        # 所有任务同时开始，等所有都完成
        # 比顺序执行快很多（总耗时 = 最慢的那个，而不是总和）
        # 参数是多个协程，返回值是结果列表（顺序和参数一致）
        results = await asyncio.gather(
            client.get("https://api.github.com/users/octocat"),
            client.get("https://api.github.com/repos/torvalds/linux"),
            client.get("https://api.github.com/events")
        )
    
    # results[0] 是第一个请求的响应，results[1] 是第二个，依此类推
    return {
        "user": results[0].json().get("login"),
        "repo": results[1].json().get("full_name"),
        "events_count": len(results[2].json())
    }

# 顺序执行：3 个请求各 1 秒 → 总共 3 秒
# 并发执行：3 个请求同时发 → 总共约 1 秒
\`\`\`

## Demo 3：后台任务（BackgroundTasks）

\`\`\`python
# 导入 FastAPI 核心类
# 导入 BackgroundTasks，FastAPI 内置的后台任务机制
from fastapi import FastAPI, BackgroundTasks
# 导入 time，用于模拟耗时操作
import time
# 导入 logging，用于记录日志
import logging

# 创建应用实例
app = FastAPI()

# 配置日志
# level=logging.INFO 表示记录 INFO 及以上级别的日志
logging.basicConfig(level=logging.INFO)
# 获取当前模块的 logger
logger = logging.getLogger(__name__)

# 后台任务函数：不需要返回值
# 后台任务可以是普通函数（def）或异步函数（async def）
def write_log(message: str):
    # 这个函数会在响应返回后异步执行
    # 用户已经收到响应，不需要等待这个函数完成
    time.sleep(3)  # 模拟耗时操作
    logger.info(f"日志写入完成: {message}")

def send_email(to: str, subject: str):
    time.sleep(2)  # 模拟邮件发送耗时
    logger.info(f"邮件已发送给 {to}: {subject}")

# 在路由里注入 BackgroundTasks
# 声明 background_tasks: BackgroundTasks 参数，FastAPI 自动注入
@app.post("/send-notification")
async def send_notification(
    email: str,                                    # 查询参数
    background_tasks: BackgroundTasks              # FastAPI 自动注入后台任务管理器
):
    # 添加后台任务
    # add_task(函数, *参数)：任务会在响应返回后执行
    # 任务函数和参数会被保存，响应返回后调用 write_log(f"通知 {email}")
    background_tasks.add_task(write_log, f"通知 {email}")
    background_tasks.add_task(send_email, email, "欢迎注册")
    
    # 立即返回响应，不等后台任务完成
    return {"message": f"通知已发送给 {email}，后台处理中"}

# POST /send-notification?email=test@example.com
# 立即返回：{"message": "通知已发送给 test@example.com，后台处理中"}
# 3 秒后日志：日志写入完成: 通知 test@example.com
# 2 秒后日志：邮件已发送给 test@example.com: 欢迎注册
\`\`\`

## Demo 4：后台任务 + 依赖注入

\`\`\`python
# 导入 FastAPI 核心类
# 导入 BackgroundTasks，后台任务管理器
# 导入 Depends，依赖注入装饰器
from fastapi import FastAPI, BackgroundTasks, Depends
# 导入 time，用于模拟耗时
import time

# 创建应用实例
app = FastAPI()

# 模拟数据库（用字典代替真实数据库）
db = {}

# 后台任务：保存操作日志
def log_action(user_id: int, action: str):
    time.sleep(1)  # 模拟数据库写入耗时
    print(f"[日志] 用户 {user_id} 执行了 {action}")

# 依赖：可以在依赖里添加后台任务
# 依赖函数也可以接收 BackgroundTasks 参数
def get_current_user(
    user_id: int,                                  # 查询参数
    background_tasks: BackgroundTasks               # FastAPI 自动注入
):
    # 在依赖里添加后台任务
    # 依赖中添加的任务会和路由中添加的任务合并，统一在响应返回后执行
    background_tasks.add_task(log_action, user_id, "登录")
    return {"user_id": user_id}

@app.post("/items")
def create_item(
    name: str,                                     # 查询参数
    user: dict = Depends(get_current_user)         # 依赖注入，自动调用 get_current_user
):
    # 依赖里的后台任务会被合并
    # 路由里的后台任务也会被合并
    # 所有任务都会在响应返回后执行
    item_id = len(db) + 1
    db[item_id] = name
    return {"item_id": item_id, "name": name}

# 后台任务执行顺序：
# 1. 依赖里的后台任务
# 2. 路由里的后台任务
\`\`\`

## Demo 5：异步生成器（SSE）

\`\`\`python
# 导入 FastAPI 核心类
from fastapi import FastAPI
# 导入 StreamingResponse，用于流式返回数据
from fastapi.responses import StreamingResponse
# 导入 asyncio，提供异步 sleep
import asyncio
# 导入 json，用于把字典转成 JSON 字符串
import json

# 创建应用实例
app = FastAPI()

# 异步生成器：用于 Server-Sent Events (SSE)
# async def + yield 定义异步生成器
# 每次产出一个值后暂停，等下次被请求时继续
async def event_generator():
    for i in range(10):
        # 产出数据
        data = {"count": i, "message": f"事件 {i}"}
        # SSE 格式：data: {json}\\n\\n
        # 必须以 "data: " 开头，以两个换行符结尾
        yield f"data: {json.dumps(data)}\\n\\n"
        # 等待 1 秒
        # await 让事件循环可以处理其他请求
        await asyncio.sleep(1)

@app.get("/events")
async def stream_events():
    # SSE（Server-Sent Events）：服务器主动推送数据给客户端
    # 适合：实时通知、进度条、聊天
    # media_type="text/event-stream" 是 SSE 的标准 MIME 类型
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )

# 前端用 EventSource 接收：
# const eventSource = new EventSource('/events');
# eventSource.onmessage = (event) => {
#     console.log(JSON.parse(event.data));
# };
\`\`\`

## Demo 6：WebSocket

\`\`\`python
# 导入 FastAPI 核心类
# 导入 WebSocket，FastAPI 的 WebSocket 连接类
# 导入 WebSocketDisconnect，客户端断开连接时抛出的异常
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

# 创建应用实例
app = FastAPI()

# 存储连接的客户端
# 用一个类管理所有连接，方便广播消息
class ConnectionManager:
    def __init__(self):
        # active_connections 保存所有活跃的 WebSocket 连接
        self.active_connections: list[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        # accept() 接受 WebSocket 握手，建立连接
        await websocket.accept()
        # 把新连接加入列表
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        # 客户端断开时，从列表中移除
        self.active_connections.remove(websocket)
    
    async def send_personal(self, message: str, websocket: WebSocket):
        # send_text 给指定客户端发送文本消息
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        # 广播给所有连接的客户端
        for connection in self.active_connections:
            await connection.send_text(message)

# 创建全局连接管理器实例
manager = ConnectionManager()

# @app.websocket 声明 WebSocket 路由
# /ws/{client_id} 中的 client_id 是路径参数
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    # 参数 websocket: WebSocket 由 FastAPI 自动注入
    # 参数 client_id: int 从路径中提取
    await manager.connect(websocket)
    # 新用户加入时广播通知
    await manager.broadcast(f"客户端 {client_id} 加入聊天")
    
    try:
        # 无限循环，持续接收消息
        while True:
            # receive_text() 等待接收客户端发来的文本消息
            # 会阻塞当前协程，直到收到消息
            data = await websocket.receive_text()
            # 收到消息后广播给所有人
            await manager.broadcast(f"客户端 {client_id}: {data}")
    except WebSocketDisconnect:
        # 客户端断开连接时，清理并通知
        manager.disconnect(websocket)
        await manager.broadcast(f"客户端 {client_id} 离开聊天")

# WebSocket 用于：
# - 实时聊天
# - 在线游戏
# - 实时协作编辑
# - 股票行情推送
\`\`\`

## 本章小结

| 知识点 | 要点 |
|--------|------|
| 同步 vs 异步 | def 同步，async def 异步 |
| 异步 IO | await asyncio.sleep()，不能 time.sleep() |
| 并发请求 | asyncio.gather 并发执行 |
| 后台任务 | BackgroundTasks.add_task() |
| SSE | 异步生成器 + StreamingResponse |
| WebSocket | @app.websocket 双向通信 |

下一章我们学习测试和部署。`
  },
  {
    id: "fa-testing",
    group: "进阶实战",
    icon: "🚀",
    title: "测试与部署",
    content: `# 测试与部署

## 测试

FastAPI 基于 Starlette，测试用 httpx 或自带的 TestClient。

## Demo 1：基本测试

\`\`\`python
# main.py
# 导入 FastAPI 核心类
from fastapi import FastAPI

# 创建应用实例
app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello, FastAPI!"}

@app.get("/items/{item_id}")
def read_item(item_id: int):
    # 参数 item_id: int 会自动转换路径参数为整数
    return {"item_id": item_id}
\`\`\`

\`\`\`python
# test_main.py
# 导入 TestClient，Starlette 提供的测试客户端
# TestClient 基于/httpx，可以直接调用 ASGI 应用，不需要启动服务器
from fastapi.testclient import TestClient
# 从 main.py 导入 app 实例
from main import app

# 创建测试客户端
# client 可以像 requests 一样发请求，但走的是 ASGI 协议
client = TestClient(app)

def test_root():
    # 发送 GET 请求
    # client.get("/") 相当于 requests.get，但不需要服务器运行
    response = client.get("/")
    # 断言状态码是 200
    assert response.status_code == 200
    # 断言返回内容
    # response.json() 把响应体解析为字典
    assert response.json() == {"message": "Hello, FastAPI!"}

def test_read_item():
    response = client.get("/items/42")
    assert response.status_code == 200
    assert response.json() == {"item_id": 42}

def test_read_item_invalid():
    # 传字符串，应该返回 422
    # "abc" 无法转成 int，FastAPI 返回 422 校验错误
    response = client.get("/items/abc")
    assert response.status_code == 422

# 运行测试：
# pip install pytest httpx
# pytest test_main.py
\`\`\`

## Demo 2：测试 POST 请求

\`\`\`python
# main.py
# 导入 FastAPI 核心类
from fastapi import FastAPI
# 导入 BaseModel，用于定义请求体模型
from pydantic import BaseModel

# 创建应用实例
app = FastAPI()

# 商品模型
class Item(BaseModel):
    name: str       # 商品名称
    price: float    # 商品价格

@app.post("/items")
def create_item(item: Item):
    # item.model_dump() 把 Pydantic 模型转成字典（Pydantic v2 用法）
    # **item.model_dump() 把字典展开为关键字参数
    return {**item.model_dump(), "total": item.price * 1.1}
\`\`\`

\`\`\`python
# test_main.py
# 导入 TestClient
from fastapi.testclient import TestClient
# 从 main.py 导入 app
from main import app

# 创建测试客户端
client = TestClient(app)

def test_create_item():
    # 发送 POST 请求，带 JSON 请求体
    # json 参数会自动设置 Content-Type: application/json
    response = client.post(
        "/items",
        json={"name": "苹果", "price": 10.0}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "苹果"
    assert data["price"] == 10.0
    assert data["total"] == 11.0  # 10.0 * 1.1

def test_create_item_invalid():
    # 缺少必填字段
    # price 是必填，缺失会触发 422 校验错误
    response = client.post(
        "/items",
        json={"name": "苹果"}  # 缺少 price
    )
    assert response.status_code == 422  # 校验失败

def test_create_item_invalid_type():
    # 类型错误
    # price 应该是 float，传字符串会触发 422
    response = client.post(
        "/items",
        json={"name": "苹果", "price": "abc"}  # price 应该是 float
    )
    assert response.status_code == 422
\`\`\`

## Demo 3：测试依赖覆盖

\`\`\`python
# main.py
# 导入 FastAPI 核心类和 Depends
from fastapi import FastAPI, Depends

# 创建应用实例
app = FastAPI()

# 依赖函数：返回数据库连接
# 实际项目中这里会连接真实数据库
def get_db():
    # 实际数据库
    return {"db": "production", "users": []}

@app.get("/users")
def get_users(db: dict = Depends(get_db)):
    # 参数 db: dict = Depends(get_db) 表示依赖注入
    # FastAPI 会调用 get_db()，把返回值赋给 db
    return db["users"]
\`\`\`

\`\`\`python
# test_main.py
# 导入 TestClient
from fastapi.testclient import TestClient
# 从 main.py 导入 app 和 get_db
from main import app, get_db

# 创建测试客户端
client = TestClient(app)

# 替代依赖函数：返回测试数据
# 覆盖 get_db，返回测试数据而不是真实数据库
def override_get_db():
    # 测试数据库
    return {"db": "test", "users": [{"id": 1, "name": "test_user"}]}

# 覆盖依赖
# app.dependency_overrides 是字典，key 是原依赖函数，value 是替代函数
# 这样所有用 Depends(get_db) 的地方都会用 override_get_db 代替
app.dependency_overrides[get_db] = override_get_db

def test_get_users():
    response = client.get("/users")
    assert response.status_code == 200
    # 返回的是测试数据库的数据
    assert response.json() == [{"id": 1, "name": "test_user"}]

# 测试结束后清理
# teardown_module 是 pytest 的钩子，模块所有测试结束后执行
def teardown_module():
    # clear() 清除所有依赖覆盖，避免影响其他测试
    app.dependency_overrides.clear()
\`\`\`

## Demo 4：测试认证

\`\`\`python
# main.py
# 导入 FastAPI 核心类、Depends、HTTPException
from fastapi import FastAPI, Depends, HTTPException
# 导入 HTTPBearer 和 HTTPAuthorizationCredentials
# HTTPBearer 是认证方案，要求请求带 Authorization: Bearer <token> 头
# HTTPAuthorizationCredentials 包含 token 信息
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# 创建应用实例
app = FastAPI()
# 创建认证方案实例
# HTTPBearer 会自动在 /docs 里显示锁图标
security = HTTPBearer()

# 认证依赖：验证 token
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # 参数 credentials 由 HTTPBearer 自动注入
    # credentials.credentials 是 token 字符串（去掉 "Bearer " 前缀后的部分）
    token = credentials.credentials
    if token != "valid-token":
        # token 无效，抛出 401
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"username": "alice"}

@app.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    # 只有通过认证才能到这里
    return user
\`\`\`

\`\`\`python
# test_main.py
# 导入 TestClient
from fastapi.testclient import TestClient
# 从 main.py 导入 app
from main import app

# 创建测试客户端
client = TestClient(app)

def test_get_me_valid_token():
    # 带 Authorization 头
    # headers 参数设置请求头
    # "Bearer valid-token" 是 HTTPBearer 要求的格式
    response = client.get(
        "/me",
        headers={"Authorization": "Bearer valid-token"}
    )
    assert response.status_code == 200
    assert response.json() == {"username": "alice"}

def test_get_me_invalid_token():
    # token 错误，应该返回 401
    response = client.get(
        "/me",
        headers={"Authorization": "Bearer invalid-token"}
    )
    assert response.status_code == 401

def test_get_me_no_token():
    # 不带 Authorization 头
    # HTTPBearer 要求必须有头，缺失返回 403（不是 401）
    response = client.get("/me")
    assert response.status_code == 403  # HTTPBearer 要求必须有头
\`\`\`

## 部署

## Demo 5：生产环境配置

\`\`\`python
# main.py
# 导入 FastAPI 核心类
from fastapi import FastAPI
# 导入 CORSMiddleware，跨域中间件
from fastapi.middleware.cors import CORSMiddleware
# 导入 BaseSettings，Pydantic 的配置管理类
# pydantic_settings 是 Pydantic v2 的配置模块（v1 在 pydantic 包里）
from pydantic_settings import BaseSettings

# 用环境变量管理配置
# 继承 BaseSettings，类属性会自动从环境变量读取
class Settings(BaseSettings):
    app_name: str = "My API"                        # 应用名称，默认 My API
    admin_email: str = "admin@example.com"          # 管理员邮箱
    debug: bool = False                             # 调试模式，生产环境必须 False
    database_url: str = "sqlite:///./test.db"       # 数据库连接字符串
    
    class Config:
        # 从 .env 文件读取环境变量
        # .env 文件格式：KEY=value
        env_file = ".env"

# 实例化配置，会自动读取环境变量和 .env 文件
settings = Settings()

# 创建应用实例
app = FastAPI(
    title=settings.app_name,
    # 生产环境关闭文档，避免暴露 API 结构
    # debug=False 时 docs_url=None，访问 /docs 返回 404
    docs_url=None if not settings.debug else "/docs",
    redoc_url=None if not settings.debug else "/redoc",
)

# 生产环境 CORS 只允许特定域名
app.add_middleware(
    CORSMiddleware,
    # debug 模式允许所有源，生产模式只允许指定域名
    allow_origins=["https://myapp.com"] if not settings.debug else ["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
\`\`\`

## Demo 6：Gunicorn + Uvicorn Workers

\`\`\`bash
# 安装
pip install "uvicorn[standard]" gunicorn

# 开发环境：单进程
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 生产环境：多进程
# -w 4：4 个 worker 进程
# -k uvicorn.workers.UvicornWorker：使用 Uvicorn 作为 worker
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# worker 数量建议：CPU 核心数 * 2 + 1
# 例如 4 核 CPU → 9 个 worker
\`\`\`

## Demo 7：Docker 部署

\`\`\`dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码
COPY . .

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
\`\`\`

\`\`\`bash
# 构建镜像
docker build -t my-fastapi-app .

# 运行容器
docker run -d -p 8000:8000 --name my-api my-fastapi-app

# 查看日志
docker logs my-api
\`\`\`

## Demo 8：Docker Compose

\`\`\`yaml
# docker-compose.yml
version: "3.8"

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
      - DEBUG=false
    depends_on:
      - db
    restart: always
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

volumes:
  postgres_data:
\`\`\`

\`\`\`bash
# 启动所有服务
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f api

# 停止
docker-compose down
\`\`\`

## 本章小结

| 知识点 | 要点 |
|--------|------|
| 基本测试 | TestClient + pytest |
| POST 测试 | client.post(url, json=data) |
| 依赖覆盖 | app.dependency_overrides |
| 认证测试 | headers={"Authorization": "Bearer ..."} |
| 生产配置 | pydantic_settings + .env |
| 多进程部署 | gunicorn + uvicorn workers |
| Docker | Dockerfile + docker-compose |

恭喜你完成了 FastAPI 实战教程！现在你已经掌握了从入门到部署的全部技能，去构建你的下一个 API 项目吧！`
  }
];
