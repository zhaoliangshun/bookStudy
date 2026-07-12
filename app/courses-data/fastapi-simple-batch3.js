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
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class UserIn(BaseModel):
    username: str
    password: str
    email: str

class UserOut(BaseModel):
    # 响应用：不含 password
    id: int
    username: str
    email: str

@app.post("/users", response_model=UserOut)
def create_user(user: UserIn):
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
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
    username: str
    password: str
    email: str
    is_active: bool

# 方式 1：response_model_exclude 排除指定字段
@app.get("/users/{username}", response_model=User, response_model_exclude={"password"})
def get_user(username: str):
    return {
        "username": "alice",
        "password": "secret",
        "email": "a@b.com",
        "is_active": True
    }

# 方式 2：response_model_include 只包含指定字段
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
from fastapi import FastAPI, status

app = FastAPI()

from pydantic import BaseModel

class Item(BaseModel):
    name: str

# 方式 1：用 status_code 参数
@app.post("/items", status_code=status.HTTP_201_CREATED)
def create_item(item: Item):
    # 返回 201 Created 而不是默认的 200
    return item

# 方式 2：用装饰器参数（和方式 1 等价）
@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int):
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
from fastapi import FastAPI, Response

app = FastAPI()

# 方式 1：通过 Response 对象设置响应头
@app.get("/items")
def get_items(response: Response):
    # 通过 Response 对象设置响应头
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
from fastapi import FastAPI, Response, Cookie

app = FastAPI()

@app.post("/login")
def login(response: Response):
    # 设置 Cookie
    # key="token", value="abc123"
    # max_age=3600 表示 1 小时后过期（秒）
    # httponly=True 表示 JS 无法读取（防 XSS）
    # secure=True 表示只通过 HTTPS 传输
    response.set_cookie(
        key="token",
        value="abc123",
        max_age=3600,
        httponly=True,
        secure=True,
        samesite="lax"  # 防止 CSRF
    )
    return {"message": "登录成功"}

@app.get("/me")
def get_me(token: str | None = Cookie(default=None)):
    # Cookie 参数：从请求头 Cookie 里读取
    # 和查询参数用法类似
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
from fastapi import FastAPI
from fastapi.responses import FileResponse

app = FastAPI()

# 返回文件下载
@app.get("/download/{filename}")
def download_file(filename: str):
    # FileResponse 会自动：
    # 1. 设置 Content-Type（根据文件后缀）
    # 2. 设置 Content-Length
    # 3. 设置 Content-Disposition（触发下载）
    return FileResponse(
        path=f"./files/{filename}",
        filename=filename,          # 下载时显示的文件名
        media_type="application/octet-stream"  # 强制下载
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
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import time

app = FastAPI()

# 生成器函数：逐块产出数据
def generate_data():
    for i in range(10):
        # yield 产出数据块
        yield f"数据块 {i}\\n"
        time.sleep(0.5)  # 模拟耗时操作

@app.get("/stream")
def stream_data():
    # StreamingResponse 逐块发送数据
    # 适合：大文件、实时日志、SSE（Server-Sent Events）
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
from fastapi import FastAPI, Request
import time

app = FastAPI()

# 用 @app.middleware("http") 注册中间件
@app.middleware("http")
async def log_requests(request: Request, call_next):
    # call_next 之前的代码：请求到达路由之前执行
    
    # 记录请求开始时间
    start_time = time.time()
    
    # 打印请求信息
    print(f"请求开始: {request.method} {request.url.path}")
    
    # call_next 把请求传递给下一个中间件或路由
    response = await call_next(request)
    
    # call_next 之后的代码：路由处理完之后执行
    
    # 计算耗时
    process_time = time.time() - start_time
    print(f"请求完成: {request.method} {request.url.path} - {process_time:.3f}s")
    
    # 在响应头里添加耗时信息
    response.headers["X-Process-Time"] = str(process_time)
    
    return response

# 中间件执行顺序：
# 请求 → 中间件1前 → 中间件2前 → 路由 → 中间件2后 → 中间件1后 → 响应
\`\`\`

## Demo 2：CORS 中间件

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS（跨域资源共享）
# 当前端（如 localhost:3000）请求后端（如 localhost:8000）时
# 浏览器会阻止跨域请求，除非后端允许

app.add_middleware(
    CORSMiddleware,
    # 允许的前端地址（* 表示所有，生产环境要指定具体域名）
    allow_origins=["http://localhost:3000", "https://myapp.com"],
    # 允许的 HTTP 方法
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    # 允许的请求头
    allow_headers=["*"],
    # 允许携带 Cookie
    allow_credentials=True,
    # 预检请求缓存时间（秒）
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
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()

# 用类定义中间件，更灵活
class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 跳过不需要认证的路径
        if request.url.path in ["/", "/docs", "/openapi.json", "/login"]:
            return await call_next(request)
        
        # 检查 Authorization 头
        token = request.headers.get("Authorization")
        if not token:
            # 返回 401 错误
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=401,
                content={"detail": "未提供认证信息"}
            )
        
        # 验证 token（简化示例）
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
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

app = FastAPI()

# 方式 1：用 HTTPException 抛出 HTTP 错误
@app.get("/items/{item_id}")
def get_item(item_id: int):
    # 模拟数据库查询
    items = {1: "apple", 2: "banana"}
    
    if item_id not in items:
        # 抛出 404 错误
        raise HTTPException(
            status_code=404,
            detail=f"Item {item_id} not found",
            headers={"X-Error": "Item not found"}  # 可选：自定义响应头
        )
    
    return {"item": items[item_id]}

# 方式 2：自定义异常处理器
class CustomException(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message

# 注册异常处理器
@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    return JSONResponse(
        status_code=400,
        content={
            "error_code": exc.code,
            "error_message": exc.message
        }
    )

@app.get("/trigger-error")
def trigger_error():
    # 抛出自定义异常
    raise CustomException(
        code="INVALID_INPUT",
        message="输入参数不合法"
    )

# GET /trigger-error
# 返回：{"error_code": "INVALID_INPUT", "error_message": "输入参数不合法"}
\`\`\`

## Demo 5：覆盖默认异常处理器

\`\`\`python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

app = FastAPI()

# 覆盖 422 校验错误的默认格式
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": "VALIDATION_ERROR",
            "message": "请求参数校验失败",
            "details": [
                {
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
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging

app = FastAPI()

# 配置日志
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

# 捕获所有未处理的异常
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # 记录详细错误到日志（不暴露给用户）
    logger.error(f"未处理异常: {exc}", exc_info=True)
    
    # 返回通用错误信息给用户
    return JSONResponse(
        status_code=500,
        content={
            "error": "INTERNAL_ERROR",
            "message": "服务器内部错误，请稍后重试"
        }
    )

@app.get("/crash")
def crash():
    # 这里会抛出 ZeroDivisionError
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
from fastapi import FastAPI
import time
import asyncio

app = FastAPI()

# 同步路由：适合 CPU 密集型任务
@app.get("/sync")
def sync_endpoint():
    # time.sleep 是同步阻塞，会卡住整个服务器
    time.sleep(2)
    return {"message": "同步完成", "time": time.time()}

# 异步路由：适合 IO 密集型任务
@app.get("/async")
async def async_endpoint():
    # asyncio.sleep 是异步等待，不会卡住服务器
    # 等待期间可以处理其他请求
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
from fastapi import FastAPI
import asyncio
import httpx

app = FastAPI()

# 异步调用外部 API
@app.get("/fetch")
async def fetch_data():
    # httpx.AsyncClient 是异步 HTTP 客户端
    async with httpx.AsyncClient() as client:
        # await 等待请求完成，期间可以处理其他请求
        response = await client.get("https://api.github.com/users/octocat")
        data = response.json()
    
    return {
        "login": data.get("login"),
        "name": data.get("name"),
        "bio": data.get("bio")
    }

# 并发请求多个 API
@app.get("/fetch-all")
async def fetch_all():
    async with httpx.AsyncClient() as client:
        # asyncio.gather 并发执行多个异步任务
        # 比顺序执行快很多（总耗时 = 最慢的那个，而不是总和）
        results = await asyncio.gather(
            client.get("https://api.github.com/users/octocat"),
            client.get("https://api.github.com/repos/torvalds/linux"),
            client.get("https://api.github.com/events")
        )
    
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
from fastapi import FastAPI, BackgroundTasks
import time
import logging

app = FastAPI()

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 后台任务函数：不需要返回值
def write_log(message: str):
    # 这个函数会在响应返回后异步执行
    time.sleep(3)  # 模拟耗时操作
    logger.info(f"日志写入完成: {message}")

def send_email(to: str, subject: str):
    time.sleep(2)
    logger.info(f"邮件已发送给 {to}: {subject}")

# 在路由里注入 BackgroundTasks
@app.post("/send-notification")
async def send_notification(
    email: str,
    background_tasks: BackgroundTasks  # FastAPI 自动注入
):
    # 添加后台任务
    # 任务会在响应返回后执行，用户不需要等待
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
from fastapi import FastAPI, BackgroundTasks, Depends
import time

app = FastAPI()

# 模拟数据库
db = {}

# 后台任务：保存操作日志
def log_action(user_id: int, action: str):
    time.sleep(1)
    print(f"[日志] 用户 {user_id} 执行了 {action}")

# 依赖：可以在依赖里添加后台任务
def get_current_user(
    user_id: int,
    background_tasks: BackgroundTasks
):
    # 在依赖里添加后台任务
    background_tasks.add_task(log_action, user_id, "登录")
    return {"user_id": user_id}

@app.post("/items")
def create_item(
    name: str,
    user: dict = Depends(get_current_user)
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
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio
import json

app = FastAPI()

# 异步生成器：用于 Server-Sent Events (SSE)
async def event_generator():
    for i in range(10):
        # 产出数据
        data = {"count": i, "message": f"事件 {i}"}
        # SSE 格式：data: {json}\\n\\n
        yield f"data: {json.dumps(data)}\\n\\n"
        # 等待 1 秒
        await asyncio.sleep(1)

@app.get("/events")
async def stream_events():
    # SSE（Server-Sent Events）：服务器主动推送数据给客户端
    # 适合：实时通知、进度条、聊天
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
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

# 存储连接的客户端
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        # 接受连接
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def send_personal(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        # 广播给所有连接的客户端
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    await manager.broadcast(f"客户端 {client_id} 加入聊天")
    
    try:
        while True:
            # 等待接收消息
            data = await websocket.receive_text()
            # 广播给所有人
            await manager.broadcast(f"客户端 {client_id}: {data}")
    except WebSocketDisconnect:
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
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello, FastAPI!"}

@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id}
\`\`\`

\`\`\`python
# test_main.py
from fastapi.testclient import TestClient
from main import app

# 创建测试客户端
client = TestClient(app)

def test_root():
    # 发送 GET 请求
    response = client.get("/")
    # 断言状态码
    assert response.status_code == 200
    # 断言返回内容
    assert response.json() == {"message": "Hello, FastAPI!"}

def test_read_item():
    response = client.get("/items/42")
    assert response.status_code == 200
    assert response.json() == {"item_id": 42}

def test_read_item_invalid():
    # 传字符串，应该返回 422
    response = client.get("/items/abc")
    assert response.status_code == 422

# 运行测试：
# pip install pytest httpx
# pytest test_main.py
\`\`\`

## Demo 2：测试 POST 请求

\`\`\`python
# main.py
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.post("/items")
def create_item(item: Item):
    return {**item.model_dump(), "total": item.price * 1.1}
\`\`\`

\`\`\`python
# test_main.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_item():
    # 发送 POST 请求，带 JSON 请求体
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
    response = client.post(
        "/items",
        json={"name": "苹果"}  # 缺少 price
    )
    assert response.status_code == 422  # 校验失败

def test_create_item_invalid_type():
    # 类型错误
    response = client.post(
        "/items",
        json={"name": "苹果", "price": "abc"}  # price 应该是 float
    )
    assert response.status_code == 422
\`\`\`

## Demo 3：测试依赖覆盖

\`\`\`python
# main.py
from fastapi import FastAPI, Depends

app = FastAPI()

def get_db():
    # 实际数据库
    return {"db": "production", "users": []}

@app.get("/users")
def get_users(db: dict = Depends(get_db)):
    return db["users"]
\`\`\`

\`\`\`python
# test_main.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def override_get_db():
    # 测试数据库
    return {"db": "test", "users": [{"id": 1, "name": "test_user"}]}

# 覆盖依赖
app.dependency_overrides[get_db] = override_get_db

def test_get_users():
    response = client.get("/users")
    assert response.status_code == 200
    # 返回的是测试数据库的数据
    assert response.json() == [{"id": 1, "name": "test_user"}]

# 测试结束后清理
def teardown_module():
    app.dependency_overrides.clear()
\`\`\`

## Demo 4：测试认证

\`\`\`python
# main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

app = FastAPI()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if token != "valid-token":
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"username": "alice"}

@app.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    return user
\`\`\`

\`\`\`python
# test_main.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_me_valid_token():
    # 带 Authorization 头
    response = client.get(
        "/me",
        headers={"Authorization": "Bearer valid-token"}
    )
    assert response.status_code == 200
    assert response.json() == {"username": "alice"}

def test_get_me_invalid_token():
    response = client.get(
        "/me",
        headers={"Authorization": "Bearer invalid-token"}
    )
    assert response.status_code == 401

def test_get_me_no_token():
    # 不带 Authorization 头
    response = client.get("/me")
    assert response.status_code == 403  # HTTPBearer 要求必须有头
\`\`\`

## 部署

## Demo 5：生产环境配置

\`\`\`python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings

# 用环境变量管理配置
class Settings(BaseSettings):
    app_name: str = "My API"
    admin_email: str = "admin@example.com"
    debug: bool = False
    database_url: str = "sqlite:///./test.db"
    
    class Config:
        env_file = ".env"  # 从 .env 文件读取

settings = Settings()

app = FastAPI(
    title=settings.app_name,
    # 生产环境关闭文档
    docs_url=None if not settings.debug else "/docs",
    redoc_url=None if not settings.debug else "/redoc",
)

# 生产环境 CORS 只允许特定域名
app.add_middleware(
    CORSMiddleware,
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
