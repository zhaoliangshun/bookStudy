// =============================================================
// FastAPI Demo 详解 - 第 3 批章节（核心机制 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   fl-dependency: 依赖注入
//   fl-middleware: 中间件
//   fl-exception:  异常处理
//   fl-async:      异步与后台任务
// =============================================================

export const chapters = [
  {
    id: "fl-dependency",
    group: "核心机制",
    icon: "💉",
    title: "依赖注入",
    content: `# 依赖注入

## 什么是依赖注入

\`\`\`python
# 依赖注入（DI）：把"准备工作"抽成函数，让路由复用
# 通俗说：路由需要的东西，让 FastAPI 自动"喂"给它
#
# 例子：多个接口都要校验用户登录
# - 不用 DI：每个接口都写一遍校验代码（重复）
# - 用 DI：写一个校验函数，每个接口声明依赖（复用）
#
# 好处：代码复用、易于测试、逻辑解耦
\`\`\`

## Demo 1：基本依赖（Depends）

\`\`\`python
from fastapi import FastAPI, Depends

app = FastAPI()

# 定义依赖函数：普通函数即可
def common_params(q: str | None = None, skip: int = 0, limit: int = 10):
    # 这个函数做"准备工作"，返回结果给路由用
    return {"q": q, "skip": skip, "limit": limit}

# 用 Depends(函数名) 声明依赖
@app.get("/items")
def list_items(commons: dict = Depends(common_params)):
    # commons 是 common_params 的返回值
    # FastAPI 自动调用 common_params，把结果传进来
    return {"items": [], **commons}

@app.get("/users")
def list_users(commons: dict = Depends(common_params)):
    # 两个路由复用同一个依赖
    return {"users": [], **commons}

# 访问 /items?q=py&skip=0&limit=5
# FastAPI 会把 q/skip/limit 传给 common_params，再把结果给 list_items
\`\`\`

## Demo 2：依赖里也能有依赖（链式）

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, Header

app = FastAPI()

# 依赖 A：解析 token
def get_token(authorization: str = Header(...)):
    # 从请求头取 authorization
    # Header(...) 表示从请求头读取，必填
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="无效的 token 格式")
    return authorization.replace("Bearer ", "")

# 依赖 B：依赖 A，再查用户
def get_current_user(token: str = Depends(get_token)):
    # token 来自 get_token 的返回值
    # 这里模拟查数据库
    if token == "abc123":
        return {"id": 1, "name": "张三"}
    raise HTTPException(status_code=401, detail="用户不存在")

# 路由依赖 B，自动连 A 一起执行
@app.get("/me")
def me(user: dict = Depends(get_current_user)):
    # 执行顺序：get_token → get_current_user → me
    return user

# 请求头要带：Authorization: Bearer abc123
\`\`\`

## Demo 3：全局依赖

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, Header

app = FastAPI()

# 校验函数
def verify_key(x_api_key: str = Header(...)):
    if x_api_key != "secret":
        raise HTTPException(status_code=403, detail="API key 错误")
    return x_api_key

# 全局依赖：所有路由都生效
app = FastAPI(dependencies=[Depends(verify_key)])

# 这个路由自动要求带 X-API-Key 头
@app.get("/items")
def list_items():
    return {"items": []}

@app.get("/users")
def list_users():
    # 也自动要求
    return {"users": []}

# 所有请求都必须带 X-API-Key: secret 头
\`\`\`

## Demo 4：路由级依赖

\`\`\`python
from fastapi import FastAPI, Depends

app = FastAPI()

def check_admin():
    # 模拟权限检查
    return {"role": "admin"}

# dependencies 参数：只执行依赖，不接收返回值
# 适合用于"检查类"依赖（只验证，不用结果）
@app.get("/admin/users", dependencies=[Depends(check_admin)])
def list_users():
    return {"users": []}

# 对比：Depends 写在函数参数里，会接收返回值
@app.get("/admin/info")
def admin_info(admin: dict = Depends(check_admin)):
    return {"admin_role": admin["role"]}
\`\`\`

## Demo 5：类作为依赖

\`\`\`python
from fastapi import FastAPI, Depends

app = FastAPI()

# 类也能作为依赖，FastAPI 会实例化它
class CommonQueryParams:
    def __init__(self, q: str | None = None, skip: int = 0, limit: int = 10):
        self.q = q
        self.skip = skip
        self.limit = limit

# 直接用类作为类型注解，FastAPI 自动实例化
@app.get("/items")
def list_items(commons: CommonQueryParams = Depends()):
    # 注意：Depends() 不传参数时，自动用参数类型作为依赖
    # 等价于 commons: CommonQueryParams = Depends(CommonQueryParams)
    return {"q": commons.q, "skip": commons.skip, "limit": commons.limit}

# 类依赖的好处：把相关参数打包成对象，结构更清晰
\`\`\`

## Demo 6：yield 依赖（资源管理）

\`\`\`python
from fastapi import FastAPI, Depends

app = FastAPI()

# 用 yield 的依赖：可以执行"清理"代码
# 类似上下文管理器（with 语句）
def get_db():
    db = "数据库连接对象"  # 模拟获取连接
    try:
        yield db  # 把 db 给路由用
        # 路由执行完后，下面的代码才运行
    finally:
        print(f"关闭连接: {db}")  # 清理资源

@app.get("/items")
def list_items(db = Depends(get_db)):
    # db 是 yield 出来的值
    return {"db": db, "items": []}

# 执行流程：
# 1. get_db 开始，创建 db
# 2. yield db 给路由
# 3. 路由执行，返回响应
# 4. get_db 继续执行 finally，关闭连接
\`\`\`

## 小结

| 用法 | 场景 |
|------|------|
| \`Depends(func)\` | 复用公共逻辑 |
| 链式依赖 | 多步骤处理（token→用户→权限） |
| 全局依赖 | 全站校验（如鉴权） |
| \`dependencies=[...]\` | 只校验不取值 |
| yield 依赖 | 资源管理（数据库连接） |

依赖注入是 FastAPI 的核心特性，**让代码复用变得优雅**。`
  },

  {
    id: "fl-middleware",
    group: "核心机制",
    icon: "🔌",
    title: "中间件",
    content: `# 中间件

## 中间件是什么

\`\`\`python
# 中间件：在请求到达路由前、响应返回前执行的代码
# 像一个"夹心层"，包裹所有路由
#
# 执行顺序（洋葱模型）：
#   请求进来 → 中间件A前 → 中间件B前 → 路由处理 → 中间件B后 → 中间件A后 → 响应出去
#
# 用途：日志、CORS、限流、压缩、修改请求/响应
\`\`\`

## Demo 1：基本中间件

\`\`\`python
import time
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def timing_middleware(request: Request, call_next):
    # 1. 请求进来，先到这里
    start = time.time()

    # 2. call_next 把请求传给下一个中间件/路由
    # 必须 await，因为路由可能是异步的
    response = await call_next(request)

    # 3. 路由返回后，这里继续执行
    duration = time.time() - start
    # 给响应加一个自定义头，记录耗时
    response.headers["X-Process-Time"] = str(round(duration, 4))
    return response

# 现在 /docs 的所有响应都带 X-Process-Time 头
@app.get("/")
def home():
    return {"msg": "hi"}
\`\`\`

## Demo 2：多个中间件顺序

\`\`\`python
from fastapi import FastAPI, Request

app = FastAPI()

# 中间件执行顺序：后添加的先执行"前"部分，先执行"后"部分
# 像洋葱一样层层包裹

@app.middleware("http")
async def middleware_a(request: Request, call_next):
    print("A 前")
    response = await call_next(request)
    print("A 后")
    return response

@app.middleware("http")
async def middleware_b(request: Request, call_next):
    print("B 前")
    response = await call_next(request)
    print("B 后")
    return response

# 请求进来打印顺序：
# B 前 → A 前 → 路由 → A 后 → B 后
# （后注册的在外层）
\`\`\`

## Demo 3：日志中间件

\`\`\`python
import time
import logging
from fastapi import FastAPI, Request

app = FastAPI()
logger = logging.getLogger("api")
logging.basicConfig(level=logging.INFO)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    # 记录请求信息
    method = request.method
    path = request.url.path
    start = time.time()

    response = await call_next(request)

    # 记录响应信息
    duration_ms = round((time.time() - start) * 1000, 2)
    logger.info(f"{method} {path} → {response.status_code} ({duration_ms}ms)")
    return response

# 所有请求都会被记录：
# INFO: GET /items → 200 (12.5ms)
\`\`\`

## Demo 4：CORS 中间件（最常用）

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS：跨域资源共享
# 浏览器默认禁止网页跨域请求 API
# 比如 http://localhost:3000 的页面访问 http://localhost:8000 的 API
# 需要服务端配置 CORS 允许

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # 允许的前端地址
        "http://localhost:5173",
    ],
    allow_credentials=True,        # 允许带 Cookie
    allow_methods=["*"],           # 允许所有 HTTP 方法
    allow_headers=["*"],           # 允许所有请求头
)

# allow_origins=["*"] 表示允许所有域名（开发时方便，生产别用）
\`\`\`

## Demo 5：GZip 压缩中间件

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI()

# 自动压缩响应，减小传输体积
# minimum_size=1000：大于 1000 字节才压缩
app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.get("/big")
def big():
    # 返回大量数据，会被自动 gzip 压缩
    return {"data": "x" * 10000}

# 客户端要在请求头声明支持 gzip：
# Accept-Encoding: gzip
# 响应头会带 Content-Encoding: gzip
\`\`\`

## Demo 6：修改请求体（高级）

\`\`\`python
from fastapi import FastAPI, Request
from starlette.responses import Response

app = FastAPI()

@app.middleware("http")
async def add_request_id(request: Request, call_next):
    # 给每个请求加一个唯一 ID（用于日志追踪）
    import uuid
    request_id = str(uuid.uuid4())[:8]

    # 把 request_id 放到 state 里，路由可以取
    request.state.request_id = request_id

    response = await call_next(request)

    # 响应头也带上，方便客户端排查
    response.headers["X-Request-ID"] = request_id
    return response

@app.get("/items")
def list_items(request: Request):
    # 路由里取中间件设置的 request_id
    rid = request.state.request_id
    return {"request_id": rid, "items": []}
\`\`\`

## Demo 7：限流中间件（简单版）

\`\`\`python
import time
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

# 简单的内存限流：每个 IP 每秒最多 5 次请求
request_counts = {}

@app.middleware("http")
async def rate_limit(request: Request, call_next):
    client_ip = request.client.host
    now = time.time()

    # 清理 1 秒前的记录
    if client_ip in request_counts:
        request_counts[client_ip] = [
            t for t in request_counts[client_ip] if now - t < 1
        ]
    else:
        request_counts[client_ip] = []

    # 检查是否超限
    if len(request_counts[client_ip]) >= 5:
        return JSONResponse(
            status_code=429,
            content={"detail": "请求太频繁，稍后再试"},
        )

    request_counts[client_ip].append(now)
    return await call_next(request)
\`\`\`

## 小结

| 中间件 | 用途 |
|------|------|
| 自定义 \`@app.middleware\` | 日志、计时、改请求 |
| CORSMiddleware | 跨域 |
| GZipMiddleware | 响应压缩 |
| BaseHTTPMiddleware | 复杂自定义 |

中间件是**洋葱模型**：请求层层进入，响应层层出去。`
  },

  {
    id: "fl-exception",
    group: "核心机制",
    icon: "⚠️",
    title: "异常处理",
    content: `# 异常处理

## 为什么要处理异常

\`\`\`python
# 不处理异常：程序崩溃，返回 500 错误，用户看不懂
# 处理异常：返回友好的错误信息，正确的状态码
#
# FastAPI 的异常处理：
# 1. HTTPException：主动抛出 HTTP 错误
# 2. 自定义异常处理器：统一处理特定异常
# 3. 全局异常处理：兜底所有未捕获的异常
\`\`\`

## Demo 1：HTTPException（最常用）

\`\`\`python
from fastapi import FastAPI, HTTPException

app = FastAPI()

# 模拟数据库
fake_db = {1: "苹果", 2: "香蕉"}

@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id not in fake_db:
        # 主动抛出 404 错误
        # status_code：HTTP 状态码
        # detail：错误信息（会作为响应体返回）
        raise HTTPException(
            status_code=404,
            detail=f"商品 {item_id} 不存在",
        )
    return {"item": fake_db[item_id]}

# 访问 /items/1 → {"item":"苹果"}
# 访问 /items/99 → 404，{"detail":"商品 99 不存在"}
\`\`\`

## Demo 2：带自定义响应头

\`\`\`python
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id < 0:
        raise HTTPException(
            status_code=400,
            detail="ID 不能为负数",
            headers={"X-Error": "invalid-id"},  # 自定义响应头
        )
    return {"item_id": item_id}

# headers 参数可以附加错误响应头
# 常用于：限流时返回 Retry-After 头
\`\`\`

## Demo 3：自定义异常类

\`\`\`python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

# 1. 定义自定义异常类
class UnicornException(Exception):
    def __init__(self, name: str):
        self.name = name

# 2. 注册异常处理器
@app.exception_handler(UnicornException)
async def unicorn_exception_handler(request: Request, exc: UnicornException):
    # 当任何地方 raise UnicornException 时，会走到这里
    # 返回 JSONResponse 统一处理
    return JSONResponse(
        status_code=418,  # 418 I'm a teapot（有趣的码）
        content={"message": f"出错了，{exc.name} 不存在"},
    )

# 3. 在路由里抛出
@app.get("/unicorns/{name}")
def get_unicorn(name: str):
    if name == "yolo":
        raise UnicornException(name=name)
    return {"name": name}

# 访问 /unicorns/yolo → 418，{"message":"出错了，yolo 不存在"}
\`\`\`

## Demo 4：覆盖默认 422 校验异常

\`\`\`python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

app = FastAPI()

# FastAPI 校验失败默认返回 422
# 可以覆盖成 400 或自定义格式
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # exc.errors() 包含详细的校验错误信息
    return JSONResponse(
        status_code=400,  # 改成 400
        content={
            "code": 400,
            "message": "参数校验失败",
            "errors": exc.errors(),  # 原始错误列表
        },
    )

@app.get("/items/{item_id}")
def get_item(item_id: int):
    return {"item_id": item_id}

# 访问 /items/abc → 400，{"code":400,"message":"参数校验失败","errors":[...]}
\`\`\`

## Demo 5：全局兜底异常处理

\`\`\`python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

# 兜底所有未捕获的 Exception
# 防止程序崩溃暴露内部错误
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # 记录日志（真实项目里）
    # logger.error(f"未处理异常: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "code": 500,
            "message": "服务器内部错误",
            # 生产环境不要返回 str(exc)，会泄露信息
            "detail": str(exc) if False else None,
        },
    )

@app.get("/crash")
def crash():
    # 模拟意外错误
    1 / 0  # ZeroDivisionError

# 访问 /crash → 500，{"code":500,"message":"服务器内部错误"}
# 而不是返回难看的堆栈跟踪
\`\`\`

## Demo 6：业务异常分层

\`\`\`python
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse

app = FastAPI()

# 业务异常基类
class BizError(Exception):
    code = 400
    message = "业务错误"

class NotFoundError(BizError):
    code = 404
    message = "资源不存在"

class AuthError(BizError):
    code = 401
    message = "未授权"

# 统一处理器
@app.exception_handler(BizError)
async def biz_error_handler(request: Request, exc: BizError):
    return JSONResponse(
        status_code=exc.code,
        content={"code": exc.code, "message": exc.message},
    )

# 业务代码直接 raise，不用关心状态码
@app.get("/users/{user_id}")
def get_user(user_id: int):
    if user_id > 100:
        raise NotFoundError()  # 自动返回 404
    return {"user_id": user_id}

@app.get("/admin")
def admin():
    raise AuthError()  # 自动返回 401
\`\`\`

## Demo 7：常用 HTTP 状态码

\`\`\`python
from fastapi import HTTPException

# 写代码时选对状态码，让 API 更规范
# 2xx 成功：
raise HTTPException(200, "OK")           # 普通成功
raise HTTPException(201, "Created")      # 创建成功
raise HTTPException(204, "No Content")   # 成功无内容

# 4xx 客户端错误：
raise HTTPException(400, "Bad Request")  # 请求格式错
raise HTTPException(401, "Unauthorized") # 未登录
raise HTTPException(403, "Forbidden")    # 无权限
raise HTTPException(404, "Not Found")    # 资源不存在
raise HTTPException(409, "Conflict")     # 冲突（重复创建）
raise HTTPException(422, "Validation")   # 校验失败
raise HTTPException(429, "Too Many")     # 限流

# 5xx 服务端错误：
raise HTTPException(500, "Server Error") # 服务端 bug
raise HTTPException(503, "Unavailable")  # 维护中
\`\`\`

## 小结

| 方式 | 场景 |
|------|------|
| \`HTTPException\` | 主动返回错误（最常用） |
| 自定义异常 + handler | 业务异常统一处理 |
| \`RequestValidationError\` handler | 改 422 格式 |
| \`Exception\` handler | 全局兜底 |

**原则**：业务错误用自定义异常，参数错误用 HTTPException，兜底用 Exception handler。`
  },

  {
    id: "fl-async",
    group: "核心机制",
    icon: "⚡",
    title: "异步与后台任务",
    content: `# 异步与后台任务

## 同步 vs 异步

\`\`\`python
# 同步（def）：一行执行完才执行下一行，遇到 IO（网络/磁盘）会阻塞
# 异步（async def）：遇到 IO 时不等，去做别的，等 IO 好了再回来
#
# 例子：餐厅点餐
# 同步：服务员点完餐站在厨房等，菜好了端给客人，再服务下一桌
# 异步：服务员点完餐把单子给厨房，立刻服务下一桌，菜好了再端
#
# FastAPI 同时支持 def 和 async def，怎么选？
# - 有 await 的 IO 操作（httpx、aiomysql）→ async def
# - 纯计算或同步库（pymysql）→ def（FastAPI 自动放线程池）
\`\`\`

## Demo 1：async def 基本用法

\`\`\`python
import asyncio
from fastapi import FastAPI

app = FastAPI()

# async def 定义异步函数
@app.get("/")
async def root():
    # await 等待异步操作完成
    # asyncio.sleep 模拟耗时操作（不阻塞线程）
    await asyncio.sleep(1)
    return {"msg": "hi"}

# 对比同步写法（也能跑，但会阻塞）：
# @app.get("/")
# def root():
#     import time
#     time.sleep(1)  # 阻塞整个线程
#     return {"msg": "hi"}
\`\`\`

## Demo 2：异步 IO 操作（httpx）

\`\`\`python
import httpx
from fastapi import FastAPI

app = FastAPI()

# 异步 HTTP 请求：用 httpx（推荐）而非 requests
@app.get("/weather")
async def get_weather():
    # httpx.AsyncClient 是异步的
    async with httpx.AsyncClient() as client:
        # await 等待请求完成，期间可以处理别的请求
        resp = await client.get(
            "https://api.example.com/weather",
            params={"city": "beijing"},
        )
    return resp.json()

# 为什么要异步？
# 假设外部 API 要 2 秒响应
# 同步：这 2 秒整个线程被占用，别的请求排队
# 异步：这 2 秒可以去处理别的请求，吞吐量大很多
\`\`\`

## Demo 3：并发执行多个异步任务

\`\`\`python
import asyncio
import httpx
from fastapi import FastAPI

app = FastAPI()

async def fetch_user(uid: int):
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://api.example.com/users/{uid}")
        return resp.json()

@app.get("/users")
async def list_users():
    # asyncio.gather 并发执行多个协程
    # 串行：3 个请求各 1 秒 = 3 秒
    # 并发：3 个请求同时 = 约 1 秒
    results = await asyncio.gather(
        fetch_user(1),
        fetch_user(2),
        fetch_user(3),
    )
    return {"users": results}
\`\`\`

## Demo 4：后台任务（BackgroundTasks）

\`\`\`python
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel

app = FastAPI()

# 后台任务：响应返回后再执行的操作
# 用途：发邮件、写日志、清理临时文件（不阻塞用户响应）

def send_email(to: str, subject: str):
    # 模拟发邮件（耗时操作）
    import time
    time.sleep(3)
    print(f"邮件已发送给 {to}: {subject}")

class EmailRequest(BaseModel):
    to: str
    subject: str

@app.post("/send")
def send(req: EmailRequest, background_tasks: BackgroundTasks):
    # 把任务加入后台队列，立即返回响应
    # add_task(函数, 参数1, 参数2, ...)
    background_tasks.add_task(send_email, req.to, req.subject)
    return {"msg": "已加入发送队列，稍后发送"}

# 用户不用等 3 秒邮件发完，立即得到响应
# 邮件在后台慢慢发
\`\`\`

## Demo 5：多个后台任务

\`\`\`python
from fastapi import FastAPI, BackgroundTasks

app = FastAPI()

def task_log(msg: str):
    print(f"[LOG] {msg}")

def task_cleanup(file_id: str):
    print(f"清理临时文件: {file_id}")

def task_notify(user_id: int):
    print(f"通知用户: {user_id}")

@app.post("/upload")
def upload(background_tasks: BackgroundTasks):
    # 可以添加多个后台任务，按顺序执行
    background_tasks.add_task(task_log, "上传完成")
    background_tasks.add_task(task_cleanup, "tmp_123")
    background_tasks.add_task(task_notify, 1)

    return {"msg": "上传成功"}

# 响应立即返回，三个任务依次在后台执行
\`\`\`

## Demo 6：依赖注入里的后台任务

\`\`\`python
from fastapi import FastAPI, BackgroundTasks, Depends

app = FastAPI()

# 后台任务也能通过依赖注入使用
def write_log(bg: BackgroundTasks):
    # 依赖函数里也能添加后台任务
    bg.add_task(lambda: print("依赖里的后台任务"))
    return bg

@app.get("/items")
def list_items(bg: BackgroundTasks = Depends(write_log)):
    # 路由里还能继续加
    bg.add_task(lambda: print("路由里的后台任务"))
    return {"items": []}

# 两个任务都会在响应后执行
\`\`\`

## Demo 7：什么时候用 async 什么时候用 def

\`\`\`python
from fastapi import FastAPI
import time

app = FastAPI()

# ✅ 用 async def 的情况：
# 1. 内部有 await 操作（httpx/aiofiles/aiomysql）
# 2. 调用其他 async 函数
@app.get("/async-example")
async def async_example():
    import aiofiles
    async with aiofiles.open("file.txt", "r") as f:
        content = await f.read()
    return {"content": content}

# ✅ 用 def 的情况：
# 1. 纯 CPU 计算（无 IO）
# 2. 用了同步库（requests/pymysql/open）
# FastAPI 会自动把 def 函数放到线程池，不阻塞事件循环
@app.get("/sync-example")
def sync_example():
    # 同步读文件，但 FastAPI 自动处理
    with open("file.txt", "r") as f:
        content = f.read()
    return {"content": content}

# ❌ 常见错误：async def 里用同步阻塞操作
@app.get("/wrong")
async def wrong():
    time.sleep(1)  # 这会阻塞整个事件循环！
    return {"msg": "bad"}

# 正确做法：要么用 def，要么用 asyncio.sleep
\`\`\`

## 小结

| 概念 | 用法 |
|------|------|
| 异步函数 | \`async def\` + \`await\` |
| 并发执行 | \`asyncio.gather()\` |
| 后台任务 | \`BackgroundTasks\` |
| 异步 HTTP | \`httpx.AsyncClient\` |

**选择原则**：有 await 用 async def，纯同步用 def，FastAPI 都能处理好。`
  }
];
